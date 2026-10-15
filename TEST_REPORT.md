# Test report

## Current status

The public workspace is now navigable, with landing, dashboard, login,
employee, attendance, and leave routes. Authenticated module screens call the
available APIs and expose loading, empty, and unauthorized/error states.

Latest validation:

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run test`: 9 files, 20 tests passed, 0 failed, 0 skipped
- `npm run build`: passed
- `npm run test:e2e`: 1 test passed, 0 failed
- `prisma validate`: passed with a non-secret local placeholder URL
- `prisma generate`: passed
- `npm audit`: 0 vulnerabilities

The authorization regression suite covers cross-tenant denial, employee
self-access, permission denial, and unauthenticated access.

The session regression suite covers opaque token storage, expiry, invalid token
rejection, token comparison, and revocation.

The password regression suite covers scrypt hashing, correct and incorrect
password verification, malformed hashes, and weak-password rejection.

The rate-limit regression suite covers per-key isolation, attempt limits,
window reset, and explicit reset after successful authentication.

The authentication API now exposes login, logout, and current-session routes.
Full route integration tests require a configured isolated PostgreSQL database
and are not yet executed.

Attendance and leave service tests cover server-supplied timestamps, duplicate
open attendance prevention, clock-out ordering, inclusive leave-day
calculation, and insufficient-balance rejection.

Playwright configuration and a public navigation smoke test are present in
`playwright.config.ts` and `tests/e2e/foundation.spec.ts`. The bundled
Chromium launch initially returned Windows `spawn UNKNOWN`, so the local
configuration now uses the installed Microsoft Edge channel.

The local project now prefers the installed Microsoft Edge channel when
available. CI still installs Chromium and executes the browser suite in a
clean Linux runner, where host-specific Windows launch failures are isolated.
Latest native Playwright result: 1 passed, 0 failed. The same public smoke
journey was also verified successfully with the integrated browser at
`http://127.0.0.1:3000`.

## Planned quality gates

1. Type check
2. Lint
3. Unit and service tests
4. Integration tests against an isolated test database
5. Playwright tests against a dedicated test environment
6. Production build

Results will be recorded only from actual command execution, including passed,
failed, and skipped counts.
