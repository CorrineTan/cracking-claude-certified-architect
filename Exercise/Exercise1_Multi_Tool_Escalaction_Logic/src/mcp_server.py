"""
MCP Server exposing 4 customer support tools via stdio transport.

This is the MCP server component. It runs as a separate subprocess,
discovered and invoked by the MCP client. Tools follow the MCP isError
pattern for structured error reporting.

Run directly:  python -m src.mcp_server
"""

import json
import os
import random
import sys
from typing import Annotated

from mcp.server.fastmcp import FastMCP
from mcp.types import CallToolResult, TextContent
from pydantic import Field

# Ensure the project root is on sys.path so we can import src.mock_data
# even when launched as a subprocess from the MCP client.
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from src.mock_data import CUSTOMERS, CUSTOMER_EMAIL_INDEX, ORDERS  # noqa: E402

SIMULATE_TRANSIENT_ERRORS = os.environ.get("SIMULATE_TRANSIENT_ERRORS", "0") == "1"

mcp = FastMCP("CustomerSupportTools")

# ──────────────────────────────────────────────────────────────────────
# Helpers — structured MCP responses
# ──────────────────────────────────────────────────────────────────────


def _error_result(
    category: str,
    retryable: bool,
    message: str,
    details: dict | None = None,
) -> CallToolResult:
    """Return a structured error via the MCP isError flag."""
    payload: dict = {
        "isError": True,
        "errorCategory": category,
        "isRetryable": retryable,
        "message": message,
    }
    if details:
        payload["details"] = details
    return CallToolResult(
        content=[TextContent(type="text", text=json.dumps(payload))],
        isError=True,
    )


def _success_result(data: dict) -> CallToolResult:
    payload = {"isError": False, "data": data}
    return CallToolResult(
        content=[TextContent(type="text", text=json.dumps(payload))],
        isError=False,
    )


def _maybe_transient(service: str) -> CallToolResult | None:
    """Optionally simulate a transient backend failure (~15 % when enabled)."""
    if SIMULATE_TRANSIENT_ERRORS and random.random() < 0.15:
        return _error_result(
            "transient",
            True,
            f"{service} temporarily unavailable. Please retry.",
            {"service": service, "timeout_ms": 5000},
        )
    return None


# ──────────────────────────────────────────────────────────────────────
# Tool 1 — get_customer
# ──────────────────────────────────────────────────────────────────────

@mcp.tool()
def get_customer(
    customer_id: Annotated[
        str | None,
        Field(description="The customer's unique identifier (format: 'CUST-XXX'). Provide this OR email."),
    ] = None,
    email: Annotated[
        str | None,
        Field(description="The customer's email address. Provide this OR customer_id."),
    ] = None,
) -> CallToolResult:
    """Retrieve and verify a customer's identity and account details.

    Use this tool FIRST when you need to identify who a customer is before
    performing any account operations (order lookups, refunds, escalations).

    OUTPUTS: Returns the customer's verified profile including name, email,
    phone, account status (active/suspended), and membership tier.

    BOUNDARY: This tool retrieves CUSTOMER identity information only.
    It does NOT return order details, transaction history, or shipping info.
    For order-specific information, use lookup_order after obtaining a
    verified customer_id from this tool.

    PREREQUISITE ROLE: A verified customer_id from this tool is required
    before calling process_refund.
    """
    if not customer_id and not email:
        return _error_result(
            "validation", False,
            "Either 'customer_id' or 'email' must be provided.",
            {"provided_fields": []},
        )

    if err := _maybe_transient("customer-db"):
        return err

    if email and not customer_id:
        customer_id = CUSTOMER_EMAIL_INDEX.get(email)
        if not customer_id:
            return _error_result(
                "validation", False,
                f"No customer found with email '{email}'.",
                {"searched_field": "email", "value": email},
            )

    customer = CUSTOMERS.get(customer_id)  # type: ignore[arg-type]
    if not customer:
        return _error_result(
            "validation", False,
            f"No customer found with ID '{customer_id}'.",
            {"searched_field": "customer_id", "value": customer_id},
        )

    return _success_result(customer)


# ──────────────────────────────────────────────────────────────────────
# Tool 2 — lookup_order
# ──────────────────────────────────────────────────────────────────────

@mcp.tool()
def lookup_order(
    order_id: Annotated[
        str,
        Field(description="The order's unique identifier (format: 'ORD-XXXX')."),
    ],
) -> CallToolResult:
    """Retrieve details for a specific order by its order ID.

    Use this tool when you need order status, items, amounts, delivery dates,
    or refund eligibility for a KNOWN order.

    OUTPUTS: Returns order details including items with quantities/prices,
    total amount, order status (pending/shipped/delivered/cancelled),
    delivery date, and refund_eligible flag.

    BOUNDARY: This tool retrieves ORDER-specific information only.
    It does NOT verify customer identity or return customer profile data.
    To confirm which customer placed the order, use get_customer first.

    IMPORTANT: This tool accepts ORDER identifiers (ORD-XXXX), not customer
    identifiers or emails. Do not pass customer IDs to this tool.
    """
    if not order_id:
        return _error_result("validation", False, "'order_id' is required.")

    if err := _maybe_transient("order-service"):
        return err

    order = ORDERS.get(order_id)
    if not order:
        return _error_result(
            "validation", False,
            f"No order found with ID '{order_id}'.",
            {"searched_field": "order_id", "value": order_id},
        )

    return _success_result(order)


# ──────────────────────────────────────────────────────────────────────
# Tool 3 — process_refund
# ──────────────────────────────────────────────────────────────────────

@mcp.tool()
def process_refund(
    customer_id: Annotated[
        str,
        Field(description="Verified customer ID from get_customer (format: 'CUST-XXX')."),
    ],
    order_id: Annotated[
        str,
        Field(description="Order ID to refund (format: 'ORD-XXXX')."),
    ],
    amount: Annotated[
        float | None,
        Field(description="Refund amount in USD. If omitted, full order total is refunded."),
    ] = None,
    reason: Annotated[
        str | None,
        Field(description="Reason for the refund (e.g., 'defective', 'wrong_item', 'not_satisfied')."),
    ] = None,
) -> CallToolResult:
    """Process a monetary refund for a delivered order.

    Use this tool ONLY after: (1) verifying the customer via get_customer,
    and (2) confirming order details and refund eligibility via lookup_order.

    OUTPUTS: Returns a refund confirmation with refund_id, amount, and
    estimated processing time.

    BUSINESS RULES:
    - Refunds above $500 require human approval (auto-escalated by the client).
    - Only delivered orders with refund_eligible=true can be refunded.
    - Cancelled or in-transit orders cannot be refunded through this tool.
    - Suspended customer accounts cannot process refunds.
    """
    if not customer_id or not order_id:
        return _error_result(
            "validation", False,
            "Both 'customer_id' and 'order_id' are required for refunds.",
        )

    customer = CUSTOMERS.get(customer_id)
    if not customer:
        return _error_result(
            "validation", False,
            f"Customer '{customer_id}' not found. Verify with get_customer first.",
        )

    if customer["status"] == "suspended":
        return _error_result(
            "permission", False,
            f"Cannot process refund: customer account '{customer_id}' is suspended.",
            {"customer_status": "suspended", "action": "contact_compliance"},
        )

    order = ORDERS.get(order_id)
    if not order:
        return _error_result("validation", False, f"Order '{order_id}' not found.")

    if order["customer_id"] != customer_id:
        return _error_result(
            "permission", False,
            f"Order '{order_id}' does not belong to customer '{customer_id}'.",
        )

    if not order.get("refund_eligible"):
        return _error_result(
            "validation", False,
            f"Order '{order_id}' is not eligible for refund (status: {order['status']}).",
            {"order_status": order["status"], "refund_eligible": False},
        )

    refund_amount = amount if amount is not None else order["total"]

    if refund_amount > order["total"]:
        return _error_result(
            "validation", False,
            f"Refund amount ${refund_amount:.2f} exceeds order total ${order['total']:.2f}.",
        )

    refund_id = f"REF-{random.randint(10000, 99999)}"
    return _success_result({
        "refund_id": refund_id,
        "order_id": order_id,
        "customer_id": customer_id,
        "amount": refund_amount,
        "reason": reason or "not_specified",
        "status": "processed",
        "estimated_completion": "3-5 business days",
    })


# ──────────────────────────────────────────────────────────────────────
# Tool 4 — escalate_to_human
# ──────────────────────────────────────────────────────────────────────

@mcp.tool()
def escalate_to_human(
    summary: Annotated[
        str,
        Field(description="Structured summary: the issue, investigation steps taken, and recommended action."),
    ],
    reason: Annotated[
        str,
        Field(description="Why escalation is needed: threshold_exceeded, customer_request, policy_exception, or unable_to_resolve."),
    ],
    customer_id: Annotated[
        str | None,
        Field(description="Customer ID for the case."),
    ] = None,
    context: Annotated[
        dict | None,
        Field(description="Additional context: order IDs, amounts, findings."),
    ] = None,
) -> CallToolResult:
    """Transfer the case to a human support agent with structured context.

    Use this tool when:
    - A refund exceeds the $500 automatic processing threshold
    - The customer explicitly requests to speak with a human
    - The issue requires a policy exception not covered by standard procedures
    - You cannot make meaningful progress after reasonable investigation

    Provide a structured summary so the human agent can continue without
    re-investigating. Returns a case_id and estimated wait time.
    """
    case_id = f"ESC-{random.randint(10000, 99999)}"
    return _success_result({
        "case_id": case_id,
        "status": "escalated",
        "assigned_queue": "tier2_support",
        "estimated_wait": "15-30 minutes",
        "summary_received": summary,
        "reason": reason,
    })


# ──────────────────────────────────────────────────────────────────────
# Entry point — run via stdio transport
# ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    mcp.run(transport="stdio")
