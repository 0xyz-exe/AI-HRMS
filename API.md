# API contract

## Status

Authentication, employee, attendance, leave, and health routes are implemented.
Department and dashboard routes remain planned.

## Conventions

- JSON responses use explicit success and error shapes.
- Request bodies and query parameters are validated with Zod.
- Authentication and organization context are resolved server-side.
- Protected endpoints return `401` for unauthenticated requests and `403` for
  authenticated users without permission.
- Resource absence and cross-tenant access must not reveal whether an object
  exists.
- Mutations create audit events where they change HR data or workflow state.

## Planned MVP resources

| Resource | Operations |
| --- | --- |
| Session | sign in, sign out, current user |
| Employees | list, get, create, update, deactivate |
| Departments | list, create, update |
| Attendance | clock in, clock out, list history, correction request |
| Leave | list types, get balance, create request, approve, reject, cancel |
| Dashboard | authorized summary metrics |

The final request and response schemas will be added alongside each route and
covered by contract tests.

## Authentication routes

- `POST /api/auth/login` accepts `organizationId`, `email`, and `password`.
  Invalid input returns `400`; invalid credentials return `401`; success sets
  an HTTP-only session cookie. Excessive attempts return `429` with
  `Retry-After`.
- `POST /api/auth/logout` revokes the current session when present and clears
  the session cookie. It is idempotent.
- `GET /api/auth/me` resolves the HTTP-only session and returns the validated
  authorization context; unauthenticated requests return `401`.

Attendance:
  - `GET /api/attendance` returns the authenticated employee's
  history; `POST /api/attendance` accepts `clock_in` or `clock_out`.

Leave:
  - `GET /api/leave` returns the authenticated employee's requests and balances.
  - `POST /api/leave` creates a validated request.
  - `PATCH /api/leave/:requestId` performs an authorized approve, reject, or
    cancel action.

Health:

- `GET /api/health` returns `{ status: "ok", service, timestamp }` without
  requiring authentication or a database connection.
