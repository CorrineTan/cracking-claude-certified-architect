"""
Agentic loop with stop_reason-based control flow and MCP tool integration.

Step 2: Implements the canonical agentic loop (Domain 1, Task 1.1):
  - Send request to Claude with tools discovered from the MCP server
  - Inspect stop_reason:
      "tool_use"  → execute requested tools via MCP, append results, loop
      "end_turn"  → extract final text and return
  - Tool results are appended to conversation history so the model
    reasons about the next action with full context

Step 5 — "parallel using shared context" (Task 1.4):
  Claude can emit multiple tool_use blocks in a single response when it
  identifies multiple concerns. All calls share the same conversation
  history (shared context). The orchestrator executes all of them in the
  same iteration and returns every result at once so Claude can synthesize
  a unified response. This is NOT subagent spawning — subagents have
  isolated contexts. This is a single agent making parallel tool calls.

Context management (Domain 5, Task 5.1):
  - Tool outputs are TRIMMED to only task-relevant fields before being
    appended to conversation history (prevents token bloat).
  - Key transactional facts are EXTRACTED into a CaseFacts block that
    persists across iterations.
  - CaseFacts are placed at the TOP of the system prompt each iteration
    to avoid the "lost in the middle" effect.

The loop integrates:
  - MCP client for tool discovery and execution (Domain 2)
  - Pre-tool-call hooks for business-rule enforcement (Step 4)
  - Automatic retry of transient errors (Step 3)
  - Post-tool-result hooks for state tracking
  - Context management for reliability (Domain 5)
"""

from __future__ import annotations

import json

from anthropic import Anthropic

import os

from .context import CaseFacts, trim_tool_result
from .hooks import ConversationState, pre_tool_call_hook, post_tool_result_hook
from .mcp_client import MCPToolClient

MODEL = os.environ.get("MODEL", "claude-sonnet-4-20250514")

BASE_SYSTEM_PROMPT = """\
You are a customer support agent for an electronics retailer.
Your goal is to help customers with order inquiries, refunds, and account issues.

WORKFLOW:
1. Always verify the customer's identity using get_customer BEFORE any other operations.
2. Look up order details with lookup_order when the customer asks about specific orders.
3. Process refunds via process_refund only after verifying both customer and order.
4. Escalate to a human agent when the situation requires it.

ERROR HANDLING:
- If a tool returns isError=true with isRetryable=true, you may retry the operation.
- If errorCategory="validation", explain the issue clearly and ask the customer for correct information.
- If errorCategory="permission", explain the restriction and offer alternatives or escalate.

ESCALATION CRITERIA (escalate_to_human):
- Refunds above $500 (automatically redirected by policy)
- Customer explicitly requests to speak with a human
- Policy exceptions or ambiguous situations
- You cannot resolve the issue after reasonable investigation

MULTI-CONCERN HANDLING:
When a customer raises multiple issues in one message:
1. Identify all distinct concerns
2. Emit multiple tool calls in a single response to investigate concerns simultaneously
3. After gathering results for all concerns, synthesize a unified response
"""

MAX_RETRIES_TRANSIENT = 2
MAX_LOOP_ITERATIONS = 20


def _build_system_prompt(case_facts: CaseFacts) -> str:
    """Build the system prompt with case facts at the top.

    Position-aware: facts go FIRST so they're in the region
    models process most reliably (Task 5.1).
    """
    facts_block = case_facts.render()
    if facts_block:
        return facts_block + "\n\n" + BASE_SYSTEM_PROMPT
    return BASE_SYSTEM_PROMPT


async def run_agent(user_message: str, *, verbose: bool = True) -> str:
    """
    Run the agentic loop for a single user message.

    Connects to the MCP server, discovers tools, then enters the
    stop_reason-driven loop until Claude returns end_turn.
    """
    anthropic = Anthropic()

    async with MCPToolClient() as mcp_client:
        tools = await mcp_client.list_tools_anthropic()

        if verbose:
            tool_names = [t["name"] for t in tools]
            print(f"  MCP tools discovered: {tool_names}")

        messages: list[dict] = [{"role": "user", "content": user_message}]
        state = ConversationState()
        case_facts = CaseFacts()
        iteration = 0

        if verbose:
            print(f"\n{'=' * 70}")
            print(f"  USER: {user_message}")
            print(f"{'=' * 70}")

        while iteration < MAX_LOOP_ITERATIONS:
            iteration += 1
            if verbose:
                print(f"\n── Iteration {iteration} ──")

            system_prompt = _build_system_prompt(case_facts)

            if verbose and case_facts.render():
                print(f"  📋 Case facts injected into system prompt")

            response = anthropic.messages.create(
                model=MODEL,
                max_tokens=4096,
                system=system_prompt,
                tools=tools,
                messages=messages,
            )

            if verbose:
                print(f"  stop_reason = {response.stop_reason}")

            # ── end_turn: model is done ──────────────────────────
            if response.stop_reason == "end_turn":
                final_text = "".join(
                    block.text for block in response.content if block.type == "text"
                )
                if verbose:
                    print(f"\n{'─' * 70}")
                    print(f"  AGENT RESPONSE:\n{final_text}")
                    print(f"{'─' * 70}")
                return final_text

            # ── tool_use: execute via MCP and continue ───────────
            if response.stop_reason == "tool_use":
                messages.append({"role": "assistant", "content": response.content})

                tool_blocks = [b for b in response.content if b.type == "tool_use"]

                if verbose and len(tool_blocks) > 1:
                    names = [b.name for b in tool_blocks]
                    print(f"\n  ⚡ Multi-tool response: {len(tool_blocks)} "
                          f"tool calls [{', '.join(names)}]")

                tool_results: list[dict] = []

                for block in tool_blocks:
                    tool_name = block.name
                    tool_input = block.input
                    tool_use_id = block.id

                    if verbose:
                        compact = json.dumps(tool_input, separators=(",", ":"))
                        print(f"\n  → {tool_name}({compact})")

                    # ── Pre-tool-call hook (client-side) ──────────
                    hook = pre_tool_call_hook(tool_name, tool_input, state)

                    if not hook.allowed:
                        if verbose:
                            print(f"    ✖ HOOK BLOCKED: {hook.reason}")

                        if hook.redirect_tool:
                            if verbose:
                                print(f"    ↪ Redirecting to {hook.redirect_tool}")

                            redirect_result = await mcp_client.call_tool(
                                hook.redirect_tool,
                                hook.redirect_inputs or {},
                            )
                            redirect_result = post_tool_result_hook(
                                hook.redirect_tool, redirect_result, state
                            )
                            case_facts.update_from_result(
                                hook.redirect_tool, redirect_result
                            )
                            redirect_result = trim_tool_result(
                                hook.redirect_tool, redirect_result
                            )

                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": tool_use_id,
                                "content": json.dumps({
                                    "hook_intercepted": True,
                                    "original_tool": tool_name,
                                    "reason": hook.reason,
                                    "redirected_to": hook.redirect_tool,
                                    "redirect_result": redirect_result,
                                }),
                            })
                        else:
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": tool_use_id,
                                "content": json.dumps({
                                    "hook_intercepted": True,
                                    "reason": hook.reason,
                                }),
                                "is_error": True,
                            })
                        continue

                    # ── Execute via MCP (with transient retries) ──
                    result = None
                    for attempt in range(1 + MAX_RETRIES_TRANSIENT):
                        result = await mcp_client.call_tool(tool_name, tool_input)

                        if not result.get("isError") or not result.get("isRetryable"):
                            break

                        if verbose and attempt < MAX_RETRIES_TRANSIENT:
                            print(
                                f"    ⟳ Transient error (attempt {attempt + 1}/"
                                f"{1 + MAX_RETRIES_TRANSIENT}), retrying…"
                            )

                    # ── Post-tool-result hook ─────────────────────
                    result = post_tool_result_hook(tool_name, result, state)

                    # ── Context management ────────────────────────
                    # 1. Extract facts BEFORE trimming (full data)
                    case_facts.update_from_result(tool_name, result)

                    # 2. Trim to only task-relevant fields
                    trimmed = trim_tool_result(tool_name, result)

                    if verbose:
                        tag = "ERROR" if trimmed.get("isError") else "OK"
                        preview = json.dumps(trimmed, indent=2)
                        if len(preview) > 300:
                            preview = preview[:300] + "…"
                        print(f"    [{tag}] {preview}")

                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use_id,
                        "content": json.dumps(trimmed),
                        "is_error": trimmed.get("isError", False),
                    })

                messages.append({"role": "user", "content": tool_results})

            else:
                if verbose:
                    print(f"  Unexpected stop_reason: {response.stop_reason}")
                break

    return "Maximum iterations reached. Please try again or ask for human assistance."
