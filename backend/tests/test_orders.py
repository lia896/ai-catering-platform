from datetime import date
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.services.orders import EventIn, requested_at
from app.services.pricing import line_total, order_totals

client = TestClient(app)


def test_line_total_rounds_to_cents():
    assert line_total(Decimal("74"), Decimal("2.5")) == Decimal("185.00")
    assert line_total(Decimal("9.99"), Decimal("3")) == Decimal("29.97")


def test_order_totals_adds_delivery_fee():
    totals = order_totals([Decimal("100.00"), Decimal("85.50")], Decimal("60"))
    assert totals == {
        "subtotal": Decimal("185.50"),
        "delivery_fee": Decimal("60.00"),
        "total": Decimal("245.50"),
    }


def test_requested_at_uses_slot_start_in_israel_time():
    at = requested_at(date(2026, 12, 10), "11:00-13:00")
    assert (at.hour, at.minute, str(at.tzinfo)) == (11, 0, "Asia/Jerusalem")


def test_delivery_requires_address():
    with pytest.raises(ValidationError):
        EventIn(
            type="יום הולדת",
            date=date(2026, 12, 10),
            slot="11:00-13:00",
            fulfillment="delivery",
            city="רמת גן",
            address=" ",
            adults=10,
            children=0,
        )


def test_orders_require_sign_in():
    response = client.post("/api/orders", json={})
    assert response.status_code in (401, 422)
    assert "error" in response.json()
