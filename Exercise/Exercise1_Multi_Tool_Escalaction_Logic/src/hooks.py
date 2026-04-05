"""
Programmatic hooks for tool call interception and post-processing.

Step 4: Implements pre-tool-call hooks that enforce business rules with
        deterministic guarantees (Domain 1, Task 1.5). Unlike prompt-based
        instructions, these hooks CANNOT be bypassed by the model.

Hooks are a CLIENT-SIDE concern — they sit between the LLM and the MCP
server, intercepting calls before they reach the server. This is the
correct architectural layer for policy enforcement.

Two enforcement rules demonstrated:
  1. Prerequisite gate: process_refund is blocked until get_customer has
     returned a verified customer_id for that customer.
  2. Threshold escalation: refunds exceeding $500 are intercepted and
     redirected to escalate_to_human automatically.
"""

from __future__ import annotations

from dataclasses import dataclass, field


REFUND_THRESHOLD = 500.00


@dataclass
class HookResult:
    """Outcome of a pre-tool-call hook evaluation."""

    allowed: bool
    reason: str = ""
    redirect_tool: str | None = None
    redirect_inputs: dict | None = None


@dataclass
class ConversationState:
    """Tracks runtime state accumulated from tool results across iterations.

    The hooks never query the backend directly — they rely on data
    observed from prior MCP tool responses (populated by post_tool_result_hook).
    """

    verified_customers: set[str] = field(default_factory=set)
    order_totals: dict[str, float] = field(default_factory=dict)


# ──────────────────────────────────────────────────────────────────────
# Pre-tool-call hook
# ──────────────────────────────────────────────────────────────────────


def pre_tool_call_hook(
    tool_name: str,
    tool_inputs: dict,
    state: ConversationState,
) -> HookResult:
    """
    Intercept outgoing tool calls BEFORE they reach the MCP server.
    Returns HookResult indicating whether the call should proceed,
    be blocked, or be redirected to a different tool.
    """

    if tool_name != "process_refund":
        return HookResult(allowed=True)

    customer_id = tool_inputs.get("customer_id")

    # ── Rule 1: Prerequisite gate ─────────────────────────────────
    if customer_id and customer_id not in state.verified_customers:
        return HookResult(
            allowed=False,
            reason=(
                f"Customer '{customer_id}' has not been verified. "
                f"Call get_customer first to obtain a verified customer ID."
            ),
        )

    # ── Rule 2: Threshold-based escalation ────────────────────────
    order_id = tool_inputs.get("order_id")
    amount = tool_inputs.get("amount")

    if amount is None and order_id:
        amount = state.order_totals.get(order_id)

    if amount is not None and amount > REFUND_THRESHOLD:
        return HookResult(
            allowed=False,
            reason=(
                f"Refund amount ${amount:.2f} exceeds the "
                f"${REFUND_THRESHOLD:.2f} automatic threshold. "
                f"Redirecting to human escalation."
            ),
            redirect_tool="escalate_to_human",
            redirect_inputs={
                "customer_id": customer_id or "unknown",
                "summary": (
                    f"Automatic escalation: refund of ${amount:.2f} for "
                    f"order {order_id} exceeds the ${REFUND_THRESHOLD:.2f} "
                    f"threshold and requires human approval."
                ),
                "reason": "threshold_exceeded",
                "context": {
                    "original_tool": "process_refund",
                    "order_id": order_id,
                    "refund_amount": amount,
                    "threshold": REFUND_THRESHOLD,
                },
            },
        )

    return HookResult(allowed=True)


# ──────────────────────────────────────────────────────────────────────
# Post-tool-result hook
# ──────────────────────────────────────────────────────────────────────


def post_tool_result_hook(
    tool_name: str,
    result: dict,
    state: ConversationState,
) -> dict:
    """
    Process tool results AFTER MCP server execution.
    Updates conversation state so downstream hooks have the data they need.
    """

    if result.get("isError"):
        return result

    data = result.get("data", {})

    if tool_name == "get_customer":
        cid = data.get("customer_id")
        if cid:
            state.verified_customers.add(cid)

    elif tool_name == "lookup_order":
        oid = data.get("order_id")
        total = data.get("total")
        if oid and total is not None:
            state.order_totals[oid] = float(total)

    return result
