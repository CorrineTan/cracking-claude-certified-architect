"""Order model and repository.

Models follow the repository pattern: each entity has a Repository class
that encapsulates all database access. Business logic lives in the model,
data access lives in the repository.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Order:
    order_id: str
    customer_id: str
    items: list[dict]
    total: float
    status: str = "pending"
    refund_eligible: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    delivered_at: datetime | None = None

    def can_refund(self) -> bool:
        return self.status == "delivered" and self.refund_eligible


class OrderRepository:
    """Repository for Order persistence operations.

    All methods are async to match the async API layer.
    In production this would wrap an async database driver.
    """

    async def find_by_id(self, order_id: str) -> dict | None:
        # Stub — would query database
        return None

    async def find_by_customer(self, customer_id: str) -> list[dict]:
        # Stub — would query database
        return []

    async def create(self, customer_id: str, items: list[dict]) -> dict:
        # Stub — would insert into database
        total = sum(item.get("price", 0) * item.get("quantity", 1) for item in items)
        return {
            "order_id": "ORD-NEW",
            "customer_id": customer_id,
            "items": items,
            "total": total,
            "status": "pending",
        }

    async def process_refund(self, order_id: str, reason: str | None = None) -> dict:
        # Stub — would update database and trigger refund
        return {
            "refund_id": "REF-NEW",
            "order_id": order_id,
            "status": "processed",
            "reason": reason or "not_specified",
        }
