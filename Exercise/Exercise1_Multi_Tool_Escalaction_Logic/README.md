**Objective:** Practice designing an agentic loop with tool integration, structured error handling, and escalation patterns.

**Domains reinforced:** Domain 1 (Agentic Architecture & Orchestration), Domain 2 (Tool Design & MCP Integration), Domain 5 (Context Management & Reliability)

- Requirement
    
    **Steps:**
    
    1. Define 3-4 MCP tools with detailed descriptions that clearly differentiate each tool's purpose, expected inputs, and boundary conditions. Include at least two tools with similar functionality that require careful description to avoid selection confusion.
    2. Implement an agentic loop that checks `stop_reason` to determine whether to continue tool execution or present the final response. Handle both `"tool_use"` and `"end_turn"` stop reasons correctly.
    3. Add structured error responses to your tools: include `errorCategory` (transient/validation/permission), `isRetryable` boolean, and human-readable descriptions. Test that the agent handles each error type appropriately (retrying transient errors, explaining business errors to the user).
    4. Implement a programmatic hook that intercepts tool calls to enforce a business rule (e.g., blocking operations above a threshold amount), redirecting to an escalation workflow when triggered.
    5. Test with multi-concern messages (e.g., requests involving multiple issues) and verify the agent decomposes the request, handles each concern, and synthesizes a unified response.

---

## Implementation

### Scenario

A **customer support resolution agent** for an electronics retailer. The agent handles order inquiries, refunds, and account issues through MCP tools served by a dedicated MCP server, connected via stdio transport.

### Architecture

**Key architectural decisions:**

- **Single agent, multiple tool calls** — when Claude identifies multiple concerns, it emits multiple `tool_use` blocks in a single response. All calls share the same conversation history (shared context). The orchestrator executes all of them in the same iteration and returns every result at once. This is "parallel using shared context" (Task 1.4) — NOT subagent spawning (which uses isolated contexts).
- **Context management** (`src/context.py`) — tool outputs are trimmed to task-relevant fields before appending to history, key facts are extracted into a `CaseFacts` block, and that block is placed at the top of the system prompt each iteration to avoid the "lost in the middle" effect (Task 5.1).
- **MCP server** (`src/mcp_server.py`) — exposes tools via `FastMCP` + stdio transport. Tools are discovered dynamically at connection time.
- **Client-side hooks** (`src/hooks.py`) — intercept tool calls between the model and the MCP server for deterministic business-rule enforcement (Task 1.5).
- **`.mcp.json`** — project-level MCP server config with env var expansion (Task 2.4).

### Project Structure

```
Exercise1_Multi_Tool_Escalaction_Logic/
├── main.py              # Entry point — runs test scenarios
├── requirements.txt     # Python dependencies
├── .env                 # API key (gitignored)
├── .mcp.json            # MCP server configuration (Domain 2, Task 2.4)
├── README.md
└── src/
    ├── __init__.py
    ├── mcp_server.py    # Steps 1 & 3 — MCP server with 4 tools + structured errors
    ├── mcp_client.py    # MCP client — tool discovery + execution
    ├── agent.py         # Steps 2 & 5 — Agentic loop with multi-tool parallel calls
    ├── hooks.py         # Step 4 — Client-side hooks for business rules
    ├── context.py       # Domain 5 — Trim outputs, extract case facts, position at top
    └── mock_data.py     # Mock customer/order database
```

### Setup

```bash
cd Exercise/Exercise1_Multi_Tool_Escalaction_Logic

# Create virtual environment (requires Python 3.10+)
python3.12 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set your API key in .env
echo 'ANTHROPIC_API_KEY=sk-ant-...' >> .env
```

### Running

```bash
source .venv/bin/activate

# List available test scenarios
python main.py

# Run a specific scenario
python main.py 1_simple_order_inquiry
python main.py 3_refund_over_threshold
python main.py 4_multi_concern

# Run all scenarios
python main.py all

# Enable random transient errors to exercise retry logic
SIMULATE_TRANSIENT_ERRORS=1 python main.py 1_simple_order_inquiry
```

---

## How Each Step Is Addressed

### Step 1 — MCP Tool Definitions with Differentiated Descriptions

**File:** `src/mcp_server.py` — `@mcp.tool()` decorated functions

Four tools are exposed by the MCP server via `FastMCP`:

| Tool | Purpose | Key Boundary |
|------|---------|-------------|
| `get_customer` | Verify customer identity by email or ID | Returns customer profile ONLY — no order data |
| `lookup_order` | Retrieve order details by order ID | Returns order data ONLY — no customer verification |
| `process_refund` | Process monetary refund | Requires prior customer verification; >$500 auto-escalates |
| `escalate_to_human` | Transfer to human agent | Structured handoff with investigation context |

**Similar tools requiring careful differentiation:** `get_customer` and `lookup_order` both retrieve data by identifier but operate on different entity types. Their docstrings include explicit `BOUNDARY` sections explaining when to use each and what NOT to expect from them. This mirrors the exam's emphasis on tool descriptions as the primary mechanism for LLM tool selection (Task 2.1).

**MCP tool discovery:** The client calls `session.list_tools()` to discover available tools at runtime, then converts MCP schemas to Anthropic API format — exactly as an MCP-integrated agent should work (Task 2.4).

### Step 2 — Agentic Loop with `stop_reason` Control Flow

**File:** `src/agent.py` — `run_agent()`

The canonical agentic loop pattern from Domain 1 (Task 1.1):

```
while iteration < MAX_ITERATIONS:
    response = client.messages.create(tools=mcp_tools, messages=...)
    
    if response.stop_reason == "end_turn":
        → Extract text, return final response
    
    elif response.stop_reason == "tool_use":
        → Append assistant message to history
        → For each tool_use block:
            1. Run pre-tool-call hook (client-side)
            2. Execute tool via MCP client (with retry for transient errors)
            3. Run post-tool-result hook (state tracking)
        → Append ALL tool_results to history
        → Continue loop
```

**Multi-tool parallel calls (Task 1.4):** When Claude identifies multiple concerns, it emits multiple `tool_use` blocks in a single response. All calls share the same conversation history — this is "parallel using shared context." The orchestrator executes all of them within one iteration and returns every result together, so Claude can synthesize a unified response.

Key design decisions:
- Loop termination is driven by `stop_reason`, NOT by parsing text content or counting iterations
- Tool results are appended to conversation history for the model to reason about
- `MAX_LOOP_ITERATIONS` is a safety bound, not the primary stopping mechanism
- Tools are called through the MCP client, not directly

### Step 3 — Structured Error Responses (MCP `isError` Pattern)

**File:** `src/mcp_server.py` — `CallToolResult` with `isError=True`

Tools return structured errors using the MCP `isError` flag on `CallToolResult`:

```json
{
    "isError": true,
    "errorCategory": "transient | validation | permission",
    "isRetryable": true | false,
    "message": "Human-readable description of what went wrong",
    "details": { "service": "order-service", "timeout_ms": 3000 }
}
```

| Category | Example | Retryable? | Agent Behaviour |
|----------|---------|-----------|----------------|
| `transient` | Database timeout | Yes | Client retries (up to 2 retries) before model sees it |
| `validation` | Order not found, missing fields | No | Model explains to customer, asks for correction |
| `permission` | Suspended account, order mismatch | No | Model explains restriction, offers alternatives |

### Step 4 — Programmatic Hooks (Client-Side Enforcement)

**File:** `src/hooks.py` — `pre_tool_call_hook()` / `post_tool_result_hook()`

Hooks sit **between** the LLM and the MCP server — they are a client-side concern:

1. **Prerequisite gate:** `process_refund` is blocked until `get_customer` has returned a verified customer_id. The `post_tool_result_hook` tracks verified customers from `get_customer` results.

2. **Threshold escalation:** Refunds exceeding **$500** are intercepted and automatically redirected to `escalate_to_human`. The `post_tool_result_hook` tracks order totals from `lookup_order` results so the hook knows the amount even when the model doesn't specify one.

**Why hooks over prompt instructions:** When business rules require guaranteed compliance (e.g., financial operations), programmatic enforcement provides deterministic guarantees that prompt-based approaches cannot match (Task 1.4, Task 1.5).

### Context Management (Domain 5, Task 5.1)

**File:** `src/context.py` — `trim_tool_result()` / `CaseFacts`

Three patterns from the exam, applied in the agentic loop:

| Pattern | What it does | Why it matters |
|---------|-------------|----------------|
| **Trim tool outputs** | `get_customer` returns 7 fields; only 5 are kept. `phone`, `created_at` stripped before appending to history. | Tool results accumulate in context and consume tokens disproportionately to their relevance. |
| **Extract case facts** | `CaseFacts` accumulates customer ID, order totals, refund statuses, escalation case IDs from each tool result. | Key transactional data survives even if earlier tool results scroll out of the model's attention window. |
| **Position at top** | `CaseFacts.render()` is prepended to the system prompt before every API call. | Models reliably process information at the beginning and end of context but may miss the middle ("lost in the middle" effect). |

Example of the injected case facts block after two tool calls:
```
CASE FACTS (extracted from prior tool results — authoritative):
- Customer: CUST-001 (Alice Johnson), status=active, tier=gold
- Order ORD-1001: $121.97, status=delivered, refund_eligible=True
- Order ORD-1002: $699.99, status=delivered, refund_eligible=True
```

### Step 5 — Multi-Concern Test Scenarios

**File:** `main.py` — `TEST_SCENARIOS`

Seven test scenarios exercise different aspects:

| Scenario | Tests |
|----------|-------|
| `1_simple_order_inquiry` | Happy path: verify → lookup → respond |
| `2_refund_under_threshold` | Refund below $500 proceeds normally |
| `3_refund_over_threshold` | Hook intercepts $699.99 refund, auto-escalates |
| `4_multi_concern` | Two issues in one message — agent must decompose and unify |
| `5_invalid_order` | Validation error (non-existent order) |
| `6_suspended_account` | Permission error (suspended account) |
| `7_explicit_human_request` | Customer requests human — immediate escalation |

The **multi-concern scenario** (`4_multi_concern`) presents two issues simultaneously and expects the agent to:
1. Decompose the request into distinct concerns
2. Emit multiple tool calls in a single response (e.g., `lookup_order` for both ORD-1001 and ORD-1002) — logged as "Multi-tool response: N tool calls"
3. Handle the escalation for the high-value refund
4. Synthesize a unified response covering both concerns

---

## Exam Concepts Demonstrated

| Exam Concept | Where Implemented |
|-------------|-------------------|
| Agentic loop lifecycle (Task 1.1) | `src/agent.py` — `run_agent()` |
| `stop_reason` control flow | `src/agent.py` — `end_turn` / `tool_use` branching |
| Parallel tool calls in shared context (Task 1.4) | `src/agent.py` — multiple `tool_use` blocks in one response |
| MCP server with tool definitions (Task 2.1) | `src/mcp_server.py` — `FastMCP` + `@mcp.tool()` |
| MCP client tool discovery (Task 2.4) | `src/mcp_client.py` — `session.list_tools()` |
| MCP `isError` flag pattern (Task 2.2) | `src/mcp_server.py` — `CallToolResult(isError=True)` |
| Structured error categories (Task 2.2) | `src/mcp_server.py` — transient/validation/permission |
| Project-scoped `.mcp.json` (Task 2.4) | `.mcp.json` with env var expansion |
| Programmatic prerequisite gates (Task 1.4) | `src/hooks.py` — customer verification check |
| Hook-based threshold enforcement (Task 1.5) | `src/hooks.py` — $500 refund redirect |
| Multi-concern decomposition (Task 1.4) | `main.py` — scenario `4_multi_concern` |
| Trimming verbose tool outputs (Task 5.1) | `src/context.py` — `trim_tool_result()` |
| Persistent case facts extraction (Task 5.1) | `src/context.py` — `CaseFacts` accumulator |
| Position-aware context (Task 5.1) | `src/agent.py` — facts at top of system prompt |
| Structured escalation handoffs (Task 1.4) | `src/hooks.py` — escalation payload construction |
| Escalation criteria (Task 5.2) | System prompt + `escalate_to_human` tool |
