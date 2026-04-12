"""Customer API routes.

All API handlers use async/await and return structured error responses
via the centralized error handler middleware.
"""

from fastapi import APIRouter, HTTPException

from src.models.customer import CustomerRepository

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/{customer_id}")
async def get_customer(customer_id: str):
    repo = CustomerRepository()
    customer = await repo.find_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
    return {"data": customer}


@router.get("/")
async def search_customers(email: str | None = None, name: str | None = None):
    repo = CustomerRepository()
    results = await repo.search(email=email, name=name)
    return {"data": results, "count": len(results)}
