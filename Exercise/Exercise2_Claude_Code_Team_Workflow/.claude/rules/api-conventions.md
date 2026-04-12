---
paths:
  - "src/api/**/*"
---

# API Conventions

These rules apply only when editing files in `src/api/`.

## Route Handlers

- Every route handler must be `async def`.
- Use `await` for all I/O: database calls, external HTTP requests, file reads.
- Never call `Repository` methods without `await` — they are all async.
- Route functions should be thin: validate input, call the repository, return the response. No business logic in route handlers.

## Error Handling

- Raise `HTTPException` for expected client errors (400, 404, 422).
- Do NOT catch exceptions in individual route handlers unless you need to transform them. Let the centralized error handler middleware handle unexpected errors.
- All error responses must follow the shape: `{"error": {"code": "...", "message": "...", "details": ...}}`.

## Route Organization

- Group routes by resource in separate files under `src/api/routes/`.
- Each route file creates its own `APIRouter` with a prefix matching the resource name.
- Register routers in `src/api/routes/__init__.py`.
