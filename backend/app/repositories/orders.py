from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Connection, text


def customer_id_for(conn: Connection, auth_user_id: str, email: str | None) -> str:
    row = conn.execute(
        text("select id from customers where auth_user_id = :uid"), {"uid": auth_user_id}
    ).scalar_one_or_none()
    if row:
        return str(row)
    # The signup trigger normally created it; this covers users created before the trigger.
    return str(
        conn.execute(
            text("""insert into customers (auth_user_id, full_name, email)
                    values (:uid, coalesce(split_part(:email, '@', 1), 'לקוח'), :email)
                    returning id"""),
            {"uid": auth_user_id, "email": email},
        ).scalar_one()
    )


def update_contact(conn: Connection, customer_id: str, name: str, phone: str) -> None:
    conn.execute(
        text("""update customers set full_name = :name, phone = :phone, updated_at = now()
                where id = :id"""),
        {"id": customer_id, "name": name, "phone": phone},
    )


def is_blocked(conn: Connection, day: date) -> bool:
    return bool(
        conn.execute(text("select 1 from blocked_dates where date = :d"), {"d": day}).first()
    )


def slot_is_open(conn: Connection, fulfillment: str, day: date, slot: str) -> bool:
    start, end = slot.split("-")
    return bool(
        conn.execute(
            text("""select 1 from time_slots
                    where is_active and fulfillment_type = cast(:f as fulfillment_type)
                      and start_time = cast(:s as time) and end_time = cast(:e as time)
                      and (weekday is null or weekday = extract(dow from cast(:d as date)))"""),
            {"f": fulfillment, "s": start, "e": end, "d": day},
        ).first()
    )


def zone_for_city(conn: Connection, city: str) -> dict | None:
    row = (
        conn.execute(
            text("""select id, fee from delivery_zones
                where is_active and definition -> 'cities' @> to_jsonb(cast(:city as text))
                order by fee limit 1"""),
            {"city": city},
        )
        .mappings()
        .first()
    )
    return dict(row) if row else None


def available_dishes(conn: Connection, ids: list[str]) -> dict[str, dict]:
    rows = conn.execute(
        text("""select id, name, pricing_unit::text as pricing_unit, unit_price from dishes
                where is_available and id = any(cast(:ids as uuid[]))"""),
        {"ids": ids},
    ).mappings()
    return {str(r["id"]): dict(r) for r in rows}


def insert_event(conn: Connection, customer_id: str, e: dict) -> str:
    return str(
        conn.execute(
            text("""insert into events (customer_id, event_type, event_date, adults, children,
                        vegetarian_guests, vegan_guests, restricted_guests, dietary_notes)
                    values (:customer_id, :type, :date, :adults, :children,
                        :vegetarian, :vegan, :restricted, :notes)
                    returning id"""),
            {"customer_id": customer_id, **e},
        ).scalar_one()
    )


def insert_order(conn: Connection, values: dict) -> str:
    return str(
        conn.execute(
            text("""insert into orders (customer_id, event_id, fulfillment_type, requested_at,
                        delivery_address, delivery_zone_id, subtotal, delivery_fee, total)
                    values (:customer_id, :event_id, cast(:fulfillment as fulfillment_type),
                        :requested_at, :address, :zone_id, :subtotal, :delivery_fee, :total)
                    returning id"""),
            values,
        ).scalar_one()
    )


def insert_items(conn: Connection, order_id: str, items: list[tuple[str, Decimal]]) -> None:
    conn.execute(
        text("insert into order_items (order_id, dish_id, quantity) values (:o, :d, :q)"),
        [{"o": order_id, "d": dish_id, "q": qty} for dish_id, qty in items],
    )


def lock_order(conn: Connection, order_id: str, customer_id: str) -> dict | None:
    row = (
        conn.execute(
            text("""select id, status::text as status, version, delivery_fee from orders
                where id = :id and customer_id = :c for update"""),
            {"id": order_id, "c": customer_id},
        )
        .mappings()
        .first()
    )
    return dict(row) if row else None


def current_lines(conn: Connection, order_id: str) -> list[dict]:
    rows = conn.execute(
        text("""select i.id, i.dish_id, i.quantity, d.name, d.pricing_unit::text as pricing_unit,
                       d.unit_price
                from order_items i join dishes d on d.id = i.dish_id
                where i.order_id = :o order by d.name"""),
        {"o": order_id},
    ).mappings()
    return [dict(r) for r in rows]


def freeze_line(conn: Connection, item_id: str, line: dict, line_total: Decimal) -> None:
    conn.execute(
        text("""update order_items set snapshot_name = :name,
                    snapshot_pricing_unit = cast(:unit as pricing_unit),
                    snapshot_unit_price = :price, snapshot_line_total = :total
                where id = :id"""),
        {
            "id": item_id,
            "name": line["name"],
            "unit": line["pricing_unit"],
            "price": line["unit_price"],
            "total": line_total,
        },
    )


def mark_submitted(conn: Connection, order_id: str, totals: dict) -> datetime:
    return conn.execute(
        text("""update orders set status = 'pending_approval', version = version + 1,
                    subtotal = :subtotal, delivery_fee = :delivery_fee, total = :total,
                    submitted_at = now(), updated_at = now()
                where id = :id returning submitted_at"""),
        {"id": order_id, **totals},
    ).scalar_one()
