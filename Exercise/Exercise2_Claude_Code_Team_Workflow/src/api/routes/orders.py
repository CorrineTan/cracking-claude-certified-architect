"""Order API routes.

All API handlers use async/await and return structured error responses
via the centralized error handler middleware.
"""

from fastapi import APIRouter, HTTPException

from src.models.order import OrderRepository

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/{order_id}")
async def get_order(order_id: str):
    repo = OrderRepository()
    order = await repo.find_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    return {"data": order}


@router.post("/")
async def create_order(customer_id: str, items: list[dict]):
    repo = OrderRepository()
    order = await repo.create(customer_id=customer_id, items=items)
    return {"data": order, "status": "created"}


@router.post("/{order_id}/refund")
async def request_refund(order_id: str, reason: str | None = None):
    repo = OrderRepository()
    order = await repo.find_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    if not order.get("refund_eligible"):
        raise HTTPException(status_code=422, detail="Order is not eligible for refund")

    result = await repo.process_refund(order_id, reason=reason)
    return {"data": result}
