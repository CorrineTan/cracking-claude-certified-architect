---
paths:
  - "src/frontend/**/*"
---

# Frontend Conventions

These rules apply only when editing files in `src/frontend/`.

## Components

- Use functional components with hooks — never class components.
- Export components as **named exports** (e.g., `export const OrderStatus`), not default exports.
- Component files go in `src/frontend/components/` and are named in PascalCase matching the component name.
- Props interfaces are defined in the same file as the component, named `{ComponentName}Props`.

## Hooks

- Custom hooks go in `src/frontend/hooks/` and are prefixed with `use` (e.g., `useOrders`).
- Hooks must handle loading, error, and success states — return an object with `{ data, isLoading, error }` or equivalent.
- Use `useCallback` for event handlers passed to child components to prevent unnecessary re-renders.

## Styling

- Use CSS class names following BEM-like conventions: `component-name`, `component-name__element`, `component-name--modifier`.
- Status-dependent styles use `status-${value}` class patterns (e.g., `status-delivered`).
