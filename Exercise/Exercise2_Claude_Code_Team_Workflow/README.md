**Objective:** Practice configuring CLAUDE.md hierarchies, custom slash commands, path-specific rules, and MCP server integration for a multi-developer project.

**Domains reinforced:** Domain 3 (Claude Code Configuration & Workflows), Domain 2 (Tool Design & MCP Integration)

- Requirement

    **Steps:**

    1. Create a project-level CLAUDE.md with universal coding standards and testing conventions. Verify that instructions placed at the project level are consistently applied across all team members.
    2. Create `.claude/rules/` files with YAML frontmatter glob patterns for different code areas (e.g., `paths: ["src/api/**/*"]` for API conventions, `paths: ["**/*.test.*"]` for testing conventions). Test that rules load only when editing matching files.
    3. Create a project-scoped skill in `.claude/skills/` with `context: fork` and `allowed-tools` restrictions. Verify the skill runs in isolation without polluting the main conversation context.
    4. Configure an MCP server in `.mcp.json` with environment variable expansion for credentials. Add a personal experimental MCP server in `~/.claude.json` and verify both are available simultaneously.
    5. Test plan mode versus direct execution on tasks of varying complexity: a single-file bug fix, a multi-file library migration, and a new feature with multiple valid implementation approaches. Observe when plan mode provides value.

---

## Implementation

### Scenario

A **full-stack web application** for an electronics retailer with a Python/FastAPI backend and React/TypeScript frontend. The project has distinct code areas (API routes, data models, UI components) with different coding conventions, making it ideal for demonstrating path-specific Claude Code configuration.

### Architecture

**Key architectural decisions:**

- **Three distinct code areas** — API handlers (`src/api/`) use async/await with structured error responses, models (`src/models/`) follow the repository pattern, and frontend components (`src/frontend/`) use functional React with hooks. Each area has its own conventions enforced via path-specific rules.
- **Configuration hierarchy** (Task 3.1) — Project-level `CLAUDE.md` contains universal standards. `.claude/rules/` files with YAML frontmatter glob patterns apply area-specific conventions conditionally. This avoids loading irrelevant rules and reduces token usage.
- **Project-scoped command** (Task 3.2) — `.claude/commands/review.md` provides a `/review` slash command available to all team members via version control.
- **Forked skill** (Task 3.2) — `.claude/skills/analyze-module/SKILL.md` runs in an isolated context (`context: fork`) with restricted tool access (`allowed-tools`) to prevent polluting the main conversation.
- **MCP server** (Task 2.4) — `.mcp.json` configures the project MCP server with `${PROJECT_API_TOKEN}` env var expansion.

### Project Structure

```
Exercise2_Claude_Code_Team_Workflow/
├── CLAUDE.md                              # Step 1 — Project-level coding standards
├── .mcp.json                              # Step 4 — MCP server config (env var expansion)
├── .claude/
│   ├── rules/
│   │   ├── api-conventions.md             # Step 2 — paths: ["src/api/**/*"]
│   │   ├── testing.md                     # Step 2 — paths: ["**/*.test.*", "**/test_*.py", "tests/**/*"]
│   │   └── frontend-conventions.md        # Step 2 — paths: ["src/frontend/**/*"]
│   ├── commands/
│   │   └── review.md                      # Project-scoped /review slash command
│   └── skills/
│       └── analyze-module/
│           └── SKILL.md                   # Step 3 — context: fork, allowed-tools
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── orders.py                  # API handler — async/await, structured errors
│   │   │   └── customers.py              
│   │   └── middleware/
│   │       └── error_handler.py           # Centralized error handling
│   ├── models/
│   │   ├── order.py                       # Repository pattern
│   │   └── customer.py                   
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── OrderStatus.tsx            # Functional component with hooks
│   │   │   └── CustomerProfile.tsx       
│   │   └── hooks/
│   │       └── useOrders.ts               # Custom hook
│   └── mcp_server.py                      # MCP server (project workflow tools)
├── tests/
│   ├── api/
│   │   └── test_orders.py                 # API tests (pytest-asyncio)
│   ├── models/
│   │   └── test_order.py                  # Model/repo tests (real DB, no mocks)
│   └── frontend/
│       ├── OrderStatus.test.tsx           # Component tests (Vitest + RTL)
│       └── useOrders.test.ts              # Hook tests
├── requirements.txt
└── package.json
```

### Setup

```bash
cd Exercise/Exercise2_Claude_Code_Team_Workflow

# Backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend (optional — sample code doesn't require actual build)
npm install

# MCP server credentials (for Step 4)
export PROJECT_API_TOKEN="your-token-here"
```

---

## How Each Step Is Addressed

### Step 1 — Project-Level CLAUDE.md with Universal Standards

**File:** `CLAUDE.md`

The project-level CLAUDE.md establishes universal standards that apply regardless of which files are being edited:

| Section | Purpose |
|---------|---------|
| Build & Run | Commands for backend, frontend, and tests |
| Python coding standards | async/await, structured errors, repository pattern |
| TypeScript coding standards | Functional components, hooks, named exports |
| Testing standards | pytest-asyncio, Vitest+RTL, descriptive test names |
| Architecture boundaries | Dependency direction rules between modules |

**Why project-level:** These standards apply to every team member. Placing them in `CLAUDE.md` at the project root (not `~/.claude/CLAUDE.md`) ensures they're version-controlled and shared. User-level config is for personal preferences only — a new team member cloning the repo wouldn't get user-level instructions (Task 3.1).

### Step 2 — Path-Specific Rules with YAML Frontmatter Glob Patterns

**Files:** `.claude/rules/api-conventions.md`, `.claude/rules/testing.md`, `.claude/rules/frontend-conventions.md`

Each rules file uses YAML frontmatter `paths` fields with glob patterns for conditional activation:

| Rule File | Glob Pattern(s) | When It Loads |
|-----------|-----------------|--------------|
| `api-conventions.md` | `src/api/**/*` | Only when editing API route or middleware files |
| `testing.md` | `**/*.test.*`, `**/test_*.py`, `tests/**/*` | When editing ANY test file, regardless of location |
| `frontend-conventions.md` | `src/frontend/**/*` | Only when editing React components or hooks |

**Why glob-pattern rules over directory-level CLAUDE.md:** The testing conventions must apply to test files spread throughout the codebase (both in `tests/` and co-located `*.test.tsx` files next to source). A directory-bound `CLAUDE.md` in `tests/` wouldn't cover co-located test files. Glob patterns like `**/*.test.*` match by file type regardless of directory location — this is the key advantage (Task 3.3, matching exam Question 6).

**Why rules over monolithic CLAUDE.md:** Path-scoped rules load only when editing matching files, reducing irrelevant context and token usage. API conventions aren't loaded when editing React components, and vice versa.

### Step 3 — Project-Scoped Skill with `context: fork` and `allowed-tools`

**File:** `.claude/skills/analyze-module/SKILL.md`

The `analyze-module` skill demonstrates three SKILL.md frontmatter features:

| Feature | Value | Purpose |
|---------|-------|---------|
| `context: fork` | Runs in isolated sub-agent context | Prevents verbose discovery output (file listings, grep results) from polluting the main conversation context (Task 3.2, Task 3.4) |
| `allowed-tools` | `Read`, `Glob`, `Grep`, `Bash` | Restricts to read-only tools — the skill cannot modify files, preventing accidental destructive actions during analysis |
| `argument-hint` | `"Module path to analyze..."` | Prompts the developer for the required module path when they invoke `/analyze-module` without arguments |

**Invocation:** `/analyze-module src/api`

**Why `context: fork`:** The Explore subagent pattern (Task 3.4) — verbose discovery output (file listings, grep results across many files) would fill the main conversation's context window. Running in a fork isolates this output and returns only the structured summary.

**Why `allowed-tools`:** Principle of least privilege — an analysis skill should never modify code. Restricting to read-only tools makes this guarantee deterministic.

### Step 4 — MCP Server Configuration with Environment Variable Expansion

**Files:** `.mcp.json`, `src/mcp_server.py`

**Project-scoped `.mcp.json`:** Configures the MCP server with `${PROJECT_API_TOKEN}` environment variable expansion for credential management without committing secrets to version control (Task 2.4).

```json
{
  "mcpServers": {
    "project-workflow-tools": {
      "command": "python",
      "args": ["src/mcp_server.py"],
      "env": {
        "PROJECT_API_TOKEN": "${PROJECT_API_TOKEN}"
      }
    }
  }
}
```

**MCP server tools:** The server exposes two tools via `FastMCP` + stdio transport:

| Tool | Purpose | Boundary |
|------|---------|----------|
| `get_project_stats` | Read-only module statistics (files, lines, coverage) | Does NOT run tests or modify code |
| `run_quality_check` | Lint, type-check, or complexity analysis | Does NOT auto-fix issues |

**Personal experimental MCP server:** To complete Step 4, add a personal server in `~/.claude.json`:

```json
{
  "mcpServers": {
    "my-experimental-tools": {
      "command": "python",
      "args": ["/path/to/my/experimental_server.py"],
      "env": {}
    }
  }
}
```

Both servers are discovered at connection time and available simultaneously. The project server is shared via version control; the personal server is not (Task 2.4).

### Step 5 — Plan Mode vs Direct Execution

This step is a hands-on testing exercise. Use the sample project to try:

| Task | Recommended Mode | Why |
|------|-----------------|-----|
| Fix a typo in `error_handler.py` | **Direct execution** | Single file, clear scope, no architectural decisions (Task 3.4) |
| Migrate from `httpx` to `aiohttp` across all API tests | **Plan mode** | Multi-file changes, need to understand all usage patterns before modifying (Task 3.4) |
| Add a new `inventory` module with API routes, models, and tests | **Plan mode** | Multiple valid approaches, architectural decisions about module structure and API design (Task 3.4) |

**Try these prompts to observe the difference:**

```
# Direct execution — well-scoped, single file
"Add a date validation check to the create_order handler in src/api/routes/orders.py 
that rejects orders with delivery dates in the past"

# Plan mode — multi-file, needs investigation first
"Migrate all pytest-asyncio tests to use the new asyncio_mode='auto' configuration 
instead of per-test markers. Affect all test files across the project."

# Plan mode — architectural decision, multiple valid approaches
"Add a product catalog module to this project. It needs API endpoints for CRUD 
operations, a Product model with inventory tracking, and React components 
for browsing and searching products."
```

---

## Exam Concepts Demonstrated

| Exam Concept | Where Implemented |
|-------------|-------------------|
| CLAUDE.md configuration hierarchy (Task 3.1) | `CLAUDE.md` at project root — shared via version control |
| User-level vs project-level config (Task 3.1) | README explains why `~/.claude/CLAUDE.md` is wrong for team standards |
| `.claude/rules/` with YAML frontmatter glob patterns (Task 3.3) | Three rule files with different `paths` patterns |
| Glob patterns for cross-directory conventions (Task 3.3) | `testing.md` uses `**/*.test.*` to match tests regardless of location |
| Path-scoped rules reduce token usage (Task 3.3) | Rules load only when editing matching files |
| Project-scoped commands in `.claude/commands/` (Task 3.2) | `/review` command shared via version control |
| Skills with `context: fork` (Task 3.2) | `analyze-module` skill isolates verbose output |
| Skills with `allowed-tools` (Task 3.2) | `analyze-module` restricted to read-only tools |
| `argument-hint` frontmatter (Task 3.2) | Prompts for module path when invoked without arguments |
| Project-scoped `.mcp.json` (Task 2.4) | MCP server config with `${PROJECT_API_TOKEN}` env var expansion |
| User-scoped `~/.claude.json` (Task 2.4) | Documented for personal experimental MCP server |
| MCP tool descriptions with boundaries (Task 2.1) | `get_project_stats` and `run_quality_check` with BOUNDARY sections |
| Plan mode for complex tasks (Task 3.4) | Step 5 comparison prompts |
| Direct execution for simple tasks (Task 3.4) | Step 5 comparison prompts |
| Explore subagent pattern (Task 3.4) | `context: fork` skill mirrors the Explore subagent isolation pattern |
