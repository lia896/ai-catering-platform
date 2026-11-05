"""Customer order rules: create a priced draft, then submit it (draft -> pending_approval)."""

from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import Literal
from uuid import UUID
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field, model_validator
from sqlalchemy import Engine

from app.core.auth import AuthUser
from app.core.errors import ApiError
from app.repositories import orders as repo
from app.services.pricing import line_total, order_totals

BUSINESS_TZ = ZoneInfo("Asia/Jerusalem")
LEAD_DAYS = 2  # PLACEHOLDER minimum lead time (OPEN #5), same as the frontend


class EventIn(BaseModel):
    type: str = Field(min_length=1)
    date: date
    slot: str = Field(pattern=r"^\d{2}:\d{2}-\d{2}:\d{2}$")
    fulfillment: Literal["pickup", "delivery"]
    city: str | None = None
    address: str | None = None
    adults: int = Field(ge=0)
    children: int = Field(ge=0)
    vegetarian: int = Field(ge=0, default=0)
    vegan: int = Field(ge=0, default=0)
    restricted: int = Field(ge=0, default=0)
    notes: str | None = None

    @model_validator(mode="after")
    def check(self):
        if self.adults + self.children <= 0:
            raise ValueError("at least one guest is required")
        if self.fulfillment == "delivery" and not (self.city and (self.address or "").strip()):
            raise ValueError("delivery needs a city and an address")
        return self


class ContactIn(BaseModel):
    name: str = Field(min_length=1)
    phone: str = Field(pattern=r"^0\d{8,9}$")


class OrderIn(BaseModel):
    event: EventIn
    items: dict[UUID, Decimal] = Field(min_length=1)
    contact: ContactIn

    @model_validator(mode="after")
    def positive(self):
        if any(q <= 0 for q in self.items.values()):
            raise ValueError("quantities must be positive")
        return self


class SubmitIn(BaseModel):
    version: int


def requested_at(day: date, slot: str) -> datetime:
    start = time.fromisoformat(slot.split("-")[0])
    return datetime.combine(day, start, tzinfo=BUSINESS_TZ)


def create_draft(engine: Engine, user: AuthUser, body: OrderIn) -> dict:
    e = body.event
    if e.date < datetime.now(BUSINESS_TZ).date() + timedelta(days=LEAD_DAYS):
        raise ApiError(422, "date_too_soon", "The event date is too close")
    with engine.begin() as conn:
        if repo.is_blocked(conn, e.date):
            raise ApiError(422, "date_blocked", "This date is closed for orders")
        if not repo.slot_is_open(conn, e.fulfillment, e.date, e.slot):
            raise ApiError(422, "slot_unavailable", "This time slot is not available")
        zone = None
        if e.fulfillment == "delivery":
            zone = repo.zone_for_city(conn, e.city or "")
            if not zone:
                raise ApiError(422, "delivery_zone_not_found", "No delivery to this city")
        ids = [str(i) for i in body.items]
        dishes = repo.available_dishes(conn, ids)
        missing = [i for i in ids if i not in dishes]
        if missing:
            raise ApiError(
                422, "dish_unavailable", "Some dishes are unavailable", {"dish_ids": missing}
            )

        customer_id = repo.customer_id_for(conn, user.id, user.email)
        repo.update_contact(conn, customer_id, body.contact.name.strip(), body.contact.phone)
        event_id = repo.insert_event(
            conn,
            customer_id,
            {
                "type": e.type,
                "date": e.date,
                "adults": e.adults,
                "children": e.children,
                "vegetarian": e.vegetarian,
                "vegan": e.vegan,
                "restricted": e.restricted,
                "notes": e.notes or None,
            },
        )
        lines = [line_total(dishes[str(i)]["unit_price"], q) for i, q in body.items.items()]
        totals = order_totals(lines, zone["fee"] if zone else Decimal("0"))
        order_id = repo.insert_order(
            conn,
            {
                "customer_id": customer_id,
                "event_id": event_id,
                "fulfillment": e.fulfillment,
                "requested_at": requested_at(e.date, e.slot),
                "address": f"{e.address.strip()}, {e.city}" if zone else None,
                "zone_id": zone["id"] if zone else None,
                **totals,
            },
        )
        repo.insert_items(conn, order_id, [(str(i), q) for i, q in body.items.items()])
        return {"id": order_id, "status": "draft", "version": 1, **totals}


def submit(engine: Engine, user: AuthUser, order_id: UUID, version: int) -> dict:
    with engine.begin() as conn:
        customer_id = repo.customer_id_for(conn, user.id, user.email)
        order = repo.lock_order(conn, str(order_id), customer_id)
        if not order:
            raise ApiError(404, "not_found", "Order not found")
        if order["status"] != "draft":
            raise ApiError(409, "invalid_transition", "Only a draft can be submitted")
        if order["version"] != version:
            raise ApiError(409, "order_version_conflict", "The order changed, reload it")
        # Freeze the price snapshot from current dish prices (ADR-0003).
        items = []
        for line in repo.current_lines(conn, str(order_id)):
            total = line_total(line["unit_price"], line["quantity"])
            repo.freeze_line(conn, str(line["id"]), line, total)
            items.append(
                {
                    "dish_id": str(line["dish_id"]),
                    "name": line["name"],
                    "quantity": line["quantity"],
                    "unit_price": line["unit_price"],
                    "line_total": total,
                }
            )
        totals = order_totals([i["line_total"] for i in items], order["delivery_fee"] or 0)
        submitted_at = repo.mark_submitted(conn, str(order_id), totals)
        return {
            "id": str(order_id),
            "status": "pending_approval",
            "version": version + 1,
            "submitted_at": submitted_at,
            "items": items,
            **totals,
        }
