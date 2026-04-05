"""
Context management for the agentic loop (Domain 5, Task 5.1).

Three patterns from the exam:

1. TRIM verbose tool outputs — only keep fields relevant to the task
   before they accumulate in conversation history. A real order lookup
   might return 40+ fields; we keep only the 5-6 that matter.

2. EXTRACT case facts — persist key transactional data (customer ID,
   order totals, statuses) into a structured block that survives
   across iterations even if earlier tool results scroll out of
   the model's effective attention window.

3. POSITION case facts at the TOP of the system prompt — mitigates
   the "lost in the middle" effect where models reliably process
   information at the beginning and end but may miss the middle.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field


# ──────────────────────────────────────────────────────────────────────
# 1. Trim verbose tool outputs
# ──────────────────────────────────────────────────────────────────────

_KEEP_FIELDS: dict[str, set[str]] = {
    "get_customer": {"customer_id", "name", "email", "status", "tier"},
    "lookup_order": {"order_id", "status", "items", "total", "refund_eligible", "delivered_at"},
    "process_refund": {"refund_id", "order_id", "amount", "status", "estimated_completion"},
    "escalate_to_human": {"case_id", "status", "estimated_wait", "reason"},
}


def trim_tool_result(tool_name: str, result: dict) -> dict:
    """Strip non-essential fields from a successful tool result.

    Error results are returned as-is (the error metadata is always relevant).
    Only the 'data' portion of successful results is trimmed.
    """
    if result.get("isError"):
        return result

    keep = _KEEP_FIELDS.get(tool_name)
    if not keep:
        return result

    data = result.get("data")
    if not isinstance(data, dict):
        return result

    trimmed = {k: v for k, v in data.items() if k in keep}
    return {"isError": False, "data": trimmed}


# ──────────────────────────────────────────────────────────────────────
# 2. Case facts accumulator
# ──────────────────────────────────────────────────────────────────────

@dataclass
class CaseFacts:
    """Structured store for key transactional facts extracted from tool results.

    These survive across loop iterations even if earlier tool results
    fall out of the model's effective attention window.
    """

    customer: dict | None = None
    orders: dict[str, dict] = field(default_factory=dict)
    refunds: list[dict] = field(default_factory=list)
    escalations: list[dict] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    def update_from_result(self, tool_name: str, result: dict) -> None:
        if result.get("isError"):
            msg = result.get("message", "unknown error")
            self.errors.append(f"{tool_name}: {msg}")
            return

        data = result.get("data", {})

        if tool_name == "get_customer":
            self.customer = {
                "customer_id": data.get("customer_id"),
                "name": data.get("name"),
                "status": data.get("status"),
                "tier": data.get("tier"),
            }

        elif tool_name == "lookup_order":
            oid = data.get("order_id")
            if oid:
                self.orders[oid] = {
                    "total": data.get("total"),
                    "status": data.get("status"),
                    "refund_eligible": data.get("refund_eligible"),
                }

        elif tool_name == "process_refund":
            self.refunds.append({
                "refund_id": data.get("refund_id"),
                "order_id": data.get("order_id"),
                "amount": data.get("amount"),
                "status": data.get("status"),
            })

        elif tool_name == "escalate_to_human":
            self.escalations.append({
                "case_id": data.get("case_id"),
                "reason": data.get("reason"),
            })

    # ──────────────────────────────────────────────────────────────
    # 3. Render as a block for the top of the system prompt
    # ──────────────────────────────────────────────────────────────

    def render(self) -> str:
        """Render accumulated facts as a text block.

        Returns empty string if no facts have been collected yet.
        Placed at the TOP of the system prompt to avoid
        'lost in the middle' effects (Task 5.1).
        """
        lines: list[str] = []

        if self.customer:
            c = self.customer
            lines.append(
                f"- Customer: {c['customer_id']} ({c['name']}), "
                f"status={c['status']}, tier={c['tier']}"
            )

        for oid, o in self.orders.items():
            lines.append(
                f"- Order {oid}: ${o['total']}, status={o['status']}, "
                f"refund_eligible={o['refund_eligible']}"
            )

        for r in self.refunds:
            lines.append(
                f"- Refund {r['refund_id']}: ${r['amount']} for {r['order_id']}, "
                f"status={r['status']}"
            )

        for e in self.escalations:
            lines.append(f"- Escalation {e['case_id']}: reason={e['reason']}")

        for err in self.errors:
            lines.append(f"- Error: {err}")

        if not lines:
            return ""

        return (
            "CASE FACTS (extracted from prior tool results — authoritative):\n"
            + "\n".join(lines)
        )
