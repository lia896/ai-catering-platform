"""Order pricing. The only place prices are computed (ADR-0003)."""

from decimal import ROUND_HALF_UP, Decimal

CENT = Decimal("0.01")


def line_total(unit_price: Decimal, quantity: Decimal) -> Decimal:
    return (Decimal(unit_price) * Decimal(quantity)).quantize(CENT, ROUND_HALF_UP)


def order_totals(line_totals: list[Decimal], delivery_fee: Decimal) -> dict[str, Decimal]:
    subtotal = sum(line_totals, Decimal("0")).quantize(CENT)
    fee = Decimal(delivery_fee).quantize(CENT)
    return {"subtotal": subtotal, "delivery_fee": fee, "total": subtotal + fee}
