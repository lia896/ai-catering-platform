from sqlalchemy import Connection, text

CATEGORIES_SQL = text("""
    select slug as id, name from dish_categories where is_active order by sort_order, name
""")

# One row per available dish. Allergens: verified rows only; a missing row means unknown.
DISHES_SQL = text("""
    select d.id, c.slug as category_id, d.name, d.description, d.image_path,
           d.pricing_unit::text as pricing_unit, d.unit_price, d.unit_label, d.currency,
           d.min_quantity, dd.kashrut_class::text as kashrut, dd.is_vegetarian, dd.is_vegan,
           coalesce(json_agg(json_build_object('name', a.name, 'status', da.status)
                             order by a.name) filter (where a.id is not null), '[]') as allergens
    from dishes d
    join dish_categories c on c.id = d.category_id and c.is_active
    left join dish_dietary dd on dd.dish_id = d.id
    left join dish_allergens da on da.dish_id = d.id
    left join allergens a on a.id = da.allergen_id
    where d.is_available
    group by d.id, c.slug, c.sort_order, dd.dish_id
    order by c.sort_order, d.name
""")

ALLERGEN_COUNT_SQL = text("select count(*) from allergens")

ZONES_SQL = text("""
    select id, name, fee, definition -> 'cities' as cities
    from delivery_zones where is_active order by fee, name
""")


def categories(conn: Connection) -> list[dict]:
    return [dict(r) for r in conn.execute(CATEGORIES_SQL).mappings()]


def dishes(conn: Connection) -> tuple[list[dict], int]:
    rows = [dict(r) for r in conn.execute(DISHES_SQL).mappings()]
    return rows, conn.execute(ALLERGEN_COUNT_SQL).scalar_one()


def delivery_zones(conn: Connection) -> list[dict]:
    return [dict(r) for r in conn.execute(ZONES_SQL).mappings()]


# shortcut: weekday-specific slots are left out (none exist yet); add a date filter when they do.
SLOTS_SQL = text("""
    select fulfillment_type::text as fulfillment,
           to_char(start_time, 'HH24:MI') || '-' || to_char(end_time, 'HH24:MI') as label
    from time_slots where is_active and weekday is null
    order by fulfillment_type, start_time
""")

BLOCKED_SQL = text("select date from blocked_dates where date >= current_date order by date")


def availability(conn: Connection) -> dict:
    slots: dict[str, list[str]] = {"pickup": [], "delivery": []}
    for row in conn.execute(SLOTS_SQL).mappings():
        slots[row["fulfillment"]].append(row["label"])
    blocked = [r[0].isoformat() for r in conn.execute(BLOCKED_SQL)]
    return {"slots": slots, "blocked_dates": blocked}
