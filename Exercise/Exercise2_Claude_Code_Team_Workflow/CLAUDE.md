# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack web application for an electronics retailer: Python/FastAPI backend + React/TypeScript frontend.

## Build & Run

```bash
# Backend
pip install -r requirements.txt
uvicorn src.api.app:app --reload

# Frontend
npm install
npm run dev

# Tests
pytest tests/                     # all Python tests
pytest tests/api/test_orders.py   # single test file
npm test                          # all frontend tests
npx vitest run tests/frontend/OrderStatus.test.tsx  # single frontend test
```

## Coding Standards

### Python (Backend)

- All API handlers must be `async def` and use `await` for I/O operations.
- Return structured JSON responses: `{"data": ...}` for success, `{"error": {"code": ..., "message": ..., "details": ...}}` for errors.
- Raise `HTTPException` for client errors; let the centralized error handler in `src/api/middleware/error_handler.py` catch unexpected exceptions.
- Models use the **repository pattern**: business logic in the dataclass, data access in the `Repository` class. Never put SQL or database calls directly in API route handlers.

### TypeScript (Frontend)

- Use **functional components** with hooks — no class components.
- Custom hooks go in `src/frontend/hooks/` and are prefixed with `use` (e.g., `useOrders`).
- Components go in `src/frontend/components/` as named exports (not default exports).

### Testing

- Python tests use **pytest** with `pytest-asyncio` for async tests.
- Frontend tests use **Vitest** + **React Testing Library**.
- Test names must describe the expected behavior, not the implementation (e.g., `test_get_order_returns_404_for_missing_order`, not `test_get_order_exception`).
- Do NOT mock the database in repository tests — use the test database.

## Architecture Boundaries

- `src/api/` depends on `src/models/` but NEVER the reverse.
- `src/frontend/` communicates with the backend only via HTTP API — no direct Python imports.
- `src/models/` has zero dependencies on `src/api/` or `src/frontend/`.

## MCP Server

A project-specific MCP server at `src/mcp_server.py` provides `get_project_stats` and `run_quality_check` tools. Configured in `.mcp.json`.
