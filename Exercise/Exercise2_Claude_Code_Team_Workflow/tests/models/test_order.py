"""Tests for Order model and OrderRepository.

Repository tests use a real test database — do NOT mock the database layer.
Model tests verify business logic on dataclass instances.
"""

import pytest
from src.models.order import Order, OrderRepository


class TestOrderModel:
    def test_can_refund_when_delivered_and_eligible(self):
        order = Order(
            order_id="ORD-001",
            customer_id="CUST-001",
            items=[],
            total=100.0,
            status="delivered",
            refund_eligible=True,
        )
        assert order.can_refund() is True

    def test_cannot_refund_when_not_delivered(self):
        order = Order(
            order_id="ORD-002",
            customer_id="CUST-001",
            items=[],
            total=50.0,
            status="shipped",
            refund_eligible=True,
        )
        assert order.can_refund() is False

    def test_cannot_refund_when_not_eligible(self):
        order = Order(
            order_id="ORD-003",
            customer_id="CUST-001",
            items=[],
            total=200.0,
            status="delivered",
            refund_eligible=False,
        )
        assert order.can_refund() is False


class TestOrderRepository:
    @pytest.mark.asyncio
    async def test_create_calculates_total(self):
        repo = OrderRepository()
        result = await repo.create(
            customer_id="CUST-001",
            items=[
                {"name": "Widget", "price": 10.0, "quantity": 2},
                {"name": "Gadget", "price": 25.0, "quantity": 1},
            ],
        )
        assert result["total"] == 45.0
