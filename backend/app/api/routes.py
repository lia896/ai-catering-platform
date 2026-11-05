from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.auth import AuthUser, current_user
from app.core.config import get_settings
from app.core.db import get_engine
from app.repositories import catalog
from app.services import orders

router = APIRouter(prefix="/api")
CurrentUser = Annotated[AuthUser, Depends(current_user)]


@router.get("/catalog/categories")
def categories() -> list[dict]:
    with get_engine().connect() as conn:
        return catalog.categories(conn)


@router.get("/catalog/dishes")
def dishes() -> list[dict]:
    base = f"{get_settings().supabase_url}/storage/v1/object/public/dish-images/"
    with get_engine().connect() as conn:
        rows, allergen_total = catalog.dishes(conn)
    for d in rows:
        path = d.pop("image_path")
        d["image_url"] = base + path if path else None
        # Every allergen has a verified status -> complete list; otherwise unknown, never "safe".
        known = [a for a in d["allergens"] if a["status"] != "unknown"]
        d["allergens_complete"] = len(known) == allergen_total
    return rows


@router.get("/catalog/delivery-zones")
def delivery_zones() -> list[dict]:
    with get_engine().connect() as conn:
        return catalog.delivery_zones(conn)


@router.get("/availability")
def availability() -> dict:
    with get_engine().connect() as conn:
        return {**catalog.availability(conn), "lead_days": orders.LEAD_DAYS}


@router.post("/orders", status_code=201)
def create_order(body: orders.OrderIn, user: CurrentUser) -> dict:
    return orders.create_draft(get_engine(), user, body)


@router.post("/orders/{order_id}/submit")
def submit_order(order_id: UUID, body: orders.SubmitIn, user: CurrentUser) -> dict:
    return orders.submit(get_engine(), user, order_id, body.version)
