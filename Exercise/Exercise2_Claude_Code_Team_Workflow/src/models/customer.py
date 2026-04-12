"""Customer model and repository.

Models follow the repository pattern: each entity has a Repository class
that encapsulates all database access.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Customer:
    customer_id: str
    name: str
    email: str
    status: str = "active"
    tier: str = "standard"
    created_at: datetime = field(default_factory=datetime.now)

    def is_active(self) -> bool:
        return self.status == "active"


class CustomerRepository:
    """Repository for Customer persistence operations."""

    async def find_by_id(self, customer_id: str) -> dict | None:
        # Stub — would query database
        return None

    async def find_by_email(self, email: str) -> dict | None:
        # Stub — would query database
        return None

    async def search(
        self, email: str | None = None, name: str | None = None
    ) -> list[dict]:
        # Stub — would query database with filters
        return []
