---
paths:
  - "**/*.test.*"
  - "**/test_*.py"
  - "tests/**/*"
---

# Testing Conventions

These rules apply to ALL test files regardless of location — both co-located tests
(`*.test.tsx` next to source) and tests in the `tests/` directory.

## General

- Test names describe expected behavior: `test_returns_404_for_missing_order`, not `test_exception`.
- Follow arrange/act/assert structure.
- One assertion concept per test. Multiple `assert` statements are fine if they verify the same behavior.

## Python Tests (pytest)

- Use `pytest.mark.asyncio` for all async test functions.
- Repository tests hit the real test database — do NOT mock the database layer.
- Use `httpx.AsyncClient` with `ASGITransport` for API integration tests, not the sync `TestClient`.
- Fixtures go in `conftest.py` at the appropriate directory level.

## Frontend Tests (Vitest + React Testing Library)

- Use `screen` queries from React Testing Library — avoid direct container queries.
- Prefer `getByRole` and `getByText` over `getByTestId`.
- Use `userEvent` (not `fireEvent`) for user interactions.
- Mock HTTP calls with MSW (Mock Service Worker), not by mocking `fetch` directly.
