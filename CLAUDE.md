# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

Practice exercises for the Claude Certified Architect exam. Each exercise is a self-contained project under `Exercise/` with its own dependencies and README.

## Working with Exercises

Each exercise lives in its own directory under `Exercise/`. They are independent — always `cd` into the specific exercise directory before running commands.

### Exercise 1: Multi-Tool Escalation Logic

```bash
cd Exercise/Exercise1_Multi_Tool_Escalaction_Logic
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Requires .env with ANTHROPIC_API_KEY=sk-ant-...

python main.py                              # list scenarios
python main.py 1_simple_order_inquiry       # run one scenario
python main.py all                          # run all scenarios
SIMULATE_TRANSIENT_ERRORS=1 python main.py 1_simple_order_inquiry  # test retry logic
```

### Exercise 2: Claude Code Team Workflow

```bash
cd Exercise/Exercise2_Claude_Code_Team_Workflow
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
npm install                                 # frontend dependencies (optional)

pytest tests/                               # run Python tests
pytest tests/api/test_orders.py             # single test file
npm test                                    # frontend tests
```

Exercise 2 is primarily about Claude Code configuration (not running code). The key deliverables are the `.claude/` directory contents, `CLAUDE.md`, and `.mcp.json`.

## Architecture (Exercise 1: Multi-Tool Escalation Logic)

A customer support agent built on the Anthropic Messages API + MCP (Model Context Protocol). The data flow is:

```
main.py (test runner)
  → src/agent.py (agentic loop — stop_reason driven)
      → Anthropic API (Claude model)
      → src/hooks.py (pre/post tool call interception — client-side)
      → src/mcp_client.py (stdio connection to MCP server)
          → src/mcp_server.py (FastMCP server with 4 tools)
              → src/mock_data.py (in-memory customer/order data)
      → src/context.py (trim outputs, extract CaseFacts, inject at top of system prompt)
```

Key architectural patterns:
- **Agentic loop** (`agent.py`): Iterates on `stop_reason` — `"tool_use"` continues the loop, `"end_turn"` terminates. Multiple `tool_use` blocks in one response are executed in the same iteration (parallel calls with shared context, not subagents).
- **Client-side hooks** (`hooks.py`): Deterministic business-rule enforcement between the LLM and MCP server. Two rules: prerequisite gate (must call `get_customer` before `process_refund`) and threshold escalation (refunds >$500 auto-redirect to `escalate_to_human`). `ConversationState` tracks verified customers and order totals from prior tool results.
- **MCP structured errors** (`mcp_server.py`): Tools return `CallToolResult(isError=True)` with `errorCategory` (transient/validation/permission) and `isRetryable`. The agent loop retries transient errors up to 2 times before surfacing to the model.
- **Context management** (`context.py`): Tool results are trimmed to relevant fields before appending to history. `CaseFacts` accumulates key data across iterations and is rendered at the top of the system prompt each loop to avoid "lost in the middle" effect.
- **MCP server** (`mcp_server.py`): Runs via stdio transport. `.mcp.json` at the exercise root configures the server with env var expansion.

## Architecture (Exercise 2: Claude Code Team Workflow)

A sample full-stack project (Python/FastAPI backend + React/TypeScript frontend) used to demonstrate Claude Code configuration patterns. The code itself is minimal — the focus is on the configuration files:

```
.claude/
  rules/
    api-conventions.md        → paths: ["src/api/**/*"]
    testing.md                → paths: ["**/*.test.*", "**/test_*.py", "tests/**/*"]
    frontend-conventions.md   → paths: ["src/frontend/**/*"]
  commands/
    review.md                 → project-scoped /review slash command
  skills/
    analyze-module/SKILL.md   → context: fork, allowed-tools: [Read, Glob, Grep, Bash]
CLAUDE.md                     → project-level universal standards
.mcp.json                     → MCP server with ${PROJECT_API_TOKEN} env var expansion
```

Key patterns:
- **Path-specific rules** (`.claude/rules/`): YAML frontmatter glob patterns conditionally load conventions only when editing matching files. Testing rules use `**/*.test.*` to apply across all directories — this is the advantage over directory-bound CLAUDE.md files.
- **Skill with `context: fork`**: Runs the `analyze-module` skill in an isolated sub-agent context to prevent verbose discovery output from filling the main conversation. Mirrors the Explore subagent pattern.
- **`allowed-tools` restriction**: The analysis skill is limited to read-only tools (Read, Glob, Grep, Bash), preventing accidental file modifications.
- **Project vs user scoping**: `.mcp.json` and `.claude/commands/` are project-scoped (shared via git). `~/.claude.json` is user-scoped (personal experimental servers).

## Exam Domains Covered

The exercises map to specific exam domains and tasks — each exercise README documents which domain/task its code demonstrates. Refer to `claude_architect_exam.pdf` at the repo root for the full exam specification.
