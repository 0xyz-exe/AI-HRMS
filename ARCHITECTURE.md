# Architecture

## Current status

The repository has a minimal Next.js foundation. This document describes the
target architecture; authentication, persistence, and HR modules do not exist
yet.

## Target stack

- Next.js with React and TypeScript
- PostgreSQL with Prisma
- Zod for boundary validation
- Tailwind CSS with accessible reusable components
- Vitest and React Testing Library
- Playwright for browser tests

The stack will be adopted incrementally and will not introduce a second
backend unless deployment or scaling requirements justify it.

## Boundaries

```text
Browser
  -> Next.js route handlers/server actions
  -> authentication and authorization policies
  -> application services
  -> Prisma repositories
  -> PostgreSQL
```

AI requests will use a separate gateway:

```text
authenticated user -> AI gateway -> authorized application tools
                   -> business services -> validated response
```

The model will never receive arbitrary SQL or unrestricted database access.

## Structural principles

- Keep transport, validation, authorization, business rules, and persistence
  separate.
- Resolve the authenticated organization and subject on the server.
- Pass authorization context into every tenant-owned service operation.
- Use transactions for leave balance changes and approval decisions.
- Emit audit events from the service boundary for consequential changes.
- Keep provider credentials server-side and isolate AI failures from core HR
  workflows.

## Authorization boundary

The policy module is the first implementation slice of the security boundary.
It validates session-shaped data with Zod and exposes explicit checks for
authentication, permissions, organization ownership, and employee self-access.
Route handlers and application services must call these checks after resolving
the server-side session and before loading or mutating tenant-owned data.

## Session boundary

`src/lib/db.ts` provides one Prisma client per process and avoids creating a
new client during development hot reloads. `src/lib/auth/session.ts` generates
opaque random tokens, stores only SHA-256 token hashes, applies an eight-hour
expiry, and resolves sessions through a repository interface. Cookie handling
and credential verification belong at the route boundary and are not yet
implemented.
