"""
Mock backend data simulating customer and order databases.
Provides realistic test data for the customer support agent.
"""

CUSTOMERS = {
    "CUST-001": {
        "customer_id": "CUST-001",
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "phone": "+1-555-0101",
        "status": "active",
        "tier": "gold",
        "created_at": "2023-01-15T10:00:00Z",
    },
    "CUST-002": {
        "customer_id": "CUST-002",
        "name": "Bob Smith",
        "email": "bob@example.com",
        "phone": "+1-555-0102",
        "status": "active",
        "tier": "standard",
        "created_at": "2023-06-20T14:30:00Z",
    },
    "CUST-003": {
        "customer_id": "CUST-003",
        "name": "Carol Williams",
        "email": "carol@example.com",
        "phone": "+1-555-0103",
        "status": "suspended",
        "tier": "standard",
        "created_at": "2024-02-10T09:15:00Z",
    },
}

CUSTOMER_EMAIL_INDEX = {c["email"]: c["customer_id"] for c in CUSTOMERS.values()}

ORDERS = {
    "ORD-1001": {
        "order_id": "ORD-1001",
        "customer_id": "CUST-001",
        "status": "delivered",
        "items": [
            {"name": "Wireless Headphones", "quantity": 1, "price": 89.99},
            {"name": "Phone Case", "quantity": 2, "price": 15.99},
        ],
        "total": 121.97,
        "ordered_at": "2024-11-01T12:00:00Z",
        "delivered_at": "2024-11-05T16:30:00Z",
        "refund_eligible": True,
    },
    "ORD-1002": {
        "order_id": "ORD-1002",
        "customer_id": "CUST-001",
        "status": "delivered",
        "items": [
            {"name": "4K Monitor", "quantity": 1, "price": 699.99},
        ],
        "total": 699.99,
        "ordered_at": "2024-10-15T09:00:00Z",
        "delivered_at": "2024-10-20T14:00:00Z",
        "refund_eligible": True,
    },
    "ORD-1003": {
        "order_id": "ORD-1003",
        "customer_id": "CUST-002",
        "status": "shipped",
        "items": [
            {"name": "USB-C Cable", "quantity": 3, "price": 12.99},
        ],
        "total": 38.97,
        "ordered_at": "2024-11-10T08:00:00Z",
        "delivered_at": None,
        "refund_eligible": False,
    },
    "ORD-1004": {
        "order_id": "ORD-1004",
        "customer_id": "CUST-002",
        "status": "delivered",
        "items": [
            {"name": "Mechanical Keyboard", "quantity": 1, "price": 149.99},
            {"name": "Mouse Pad", "quantity": 1, "price": 24.99},
        ],
        "total": 174.98,
        "ordered_at": "2024-09-01T10:00:00Z",
        "delivered_at": "2024-09-06T11:00:00Z",
        "refund_eligible": True,
    },
}
