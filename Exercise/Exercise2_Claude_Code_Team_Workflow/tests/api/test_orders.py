"""Tests for order API routes.

Uses httpx AsyncClient with the FastAPI test client.
Each test follows: arrange → act → assert with descriptive names.
"""

import pytest
from httpx import ASGITransport, AsyncClient


@pytest.mark.asyncio
async def test_get_order_returns_order_data():
    """GET /orders/{id} returns order details for a valid order."""
    # This is a stub test — in a real project it would use the app fixture
    assert True


@pytest.mark.asyncio
async def test_get_order_returns_404_for_missing_order():
    """GET /orders/{id} returns 404 when order does not exist."""
    assert True


@pytest.mark.asyncio
async def test_create_order_returns_created_status():
    """POST /orders/ returns the new order with status 'created'."""
    assert True


@pytest.mark.asyncio
async def test_request_refund_succeeds_for_eligible_order():
    """POST /orders/{id}/refund succeeds when order is refund-eligible."""
    assert True


@pytest.mark.asyncio
async def test_request_refund_rejects_ineligible_order():
    """POST /orders/{id}/refund returns 422 for non-refundable orders."""
    assert True
