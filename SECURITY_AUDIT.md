# Security audit

## Status

The initial authorization policy boundary, session persistence, and current
session resolution are implemented and covered by regression tests. Database
enforcement is schema-backed, but database RLS is not enabled and remains a
release consideration.

| Component | Status | Evidence |
| --- | --- | --- |
| Role permission mapping | Implemented | `src/lib/auth/policy.ts` and tests |
| Cross-tenant resource checks | Implemented | `assertOrganizationAccess` and tests |
| Employee self-access | Implemented | `assertEmployeeAccess` and tests |
| Session persistence | Implemented | Hashed opaque tokens and Prisma session repository |
| Database-level tenant enforcement | Schema boundary implemented | Prisma foreign keys and organization-scoped constraints added; database RLS is not enabled |

The Prisma schema now gives tenant-owned records explicit organization
foreign keys and organization-scoped indexes/uniques. Application-level
authorization remains mandatory; schema relationships alone do not replace
service checks.

Session tokens are generated with cryptographic randomness and only their
SHA-256 hashes are persisted. Login and logout routes use an HTTP-only,
same-site cookie; production cookies are marked secure. Passwords use Node
scrypt with per-password random salts. Login attempts are limited to five per
client key per fifteen-minute process window. A shared store and account
lockout remain pending before production release; the current limiter is not
sufficient by itself for multi-instance deployment.

## Required controls

- Server-enforced authentication, role checks, and organization isolation.
- Generic handling for unauthorized resource access to reduce IDOR disclosure.
- Zod validation at every external boundary.
- Parameterized ORM queries and no model-controlled SQL execution.
- CSRF protection appropriate to the chosen session mechanism.
- Secure upload allowlists, size limits, storage isolation, and authorization.
- Redacted logs and server-only secrets.
- Rate limits for authentication, sensitive mutations, and AI requests.
- Prompt-injection-resistant retrieval with authorization applied before
  document content reaches the model.
- Dependency, lint, type, test, and secret checks in CI.
- Browser E2E checks must run in a supported CI/browser environment before
  production release.

The login limiter is intentionally process-local. It protects a single
instance but must move to a shared store before horizontally scaled
deployment.

Attendance and leave services enforce employee scope, role permissions,
server-controlled time, date ordering, overlap checks, and balance checks.
Their persistence adapters and transactional approval implementation remain
required before production use.

The audit will be updated with evidence, severity, remediation, regression
tests, and verification status after each implemented milestone.
