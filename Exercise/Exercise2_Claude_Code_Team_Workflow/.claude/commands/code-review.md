Review the current changes against this project's coding standards.

## Checklist

For each changed file, verify:

### Python files (src/api/, src/models/)
- [ ] API handlers are `async def` with proper `await` usage
- [ ] Error responses follow `{"error": {"code": ..., "message": ..., "details": ...}}` shape
- [ ] Business logic is in models, not route handlers
- [ ] Repository pattern is followed — no raw database calls in routes

### TypeScript files (src/frontend/)
- [ ] Components are functional with hooks (no class components)
- [ ] Components use named exports, not default exports
- [ ] Custom hooks return `{ data, isLoading, error }` or equivalent
- [ ] Props interfaces are defined and named `{ComponentName}Props`

### Test files
- [ ] Test names describe expected behavior
- [ ] Python tests use `pytest.mark.asyncio` for async functions
- [ ] Frontend tests use `screen` queries and `userEvent`
- [ ] No database mocking in repository tests

### Architecture
- [ ] `src/api/` does not import from `src/frontend/`
- [ ] `src/models/` does not import from `src/api/` or `src/frontend/`
- [ ] No circular dependencies introduced

Report findings with severity levels: **error** (must fix), **warning** (should fix), **info** (suggestion).
