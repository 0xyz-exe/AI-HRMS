# AI HRMS Product Requirements Document

## Status

This document defines the planned MVP. The repository has a working foundation,
authentication, authorization, employee services, and attendance/leave
business-rule services; HTTP/database workflow adapters are still incomplete.

## Product objective

Provide organizations with a secure, organization-scoped HR workspace for
employee records, attendance, leave, and auditable HR operations. The system
must make authorized HR information easier to find without exposing employee
data across organizational boundaries.

## Personas and primary journeys

- **Super administrator:** creates an organization and manages its HR
  administrators.
- **HR administrator/staff:** maintains employee records, departments, leave
  policies, and approvals.
- **Manager:** reviews authorized team attendance and leave requests.
- **Employee:** views their own profile and balances, records attendance, and
  submits leave requests.

### MVP journeys

1. A user signs in and is routed to a dashboard appropriate to their role.
2. HR staff create, search, update, and deactivate employees within their
   organization.
3. An employee submits a validated leave request; an authorized manager or HR
   user approves or rejects it with an audit entry.
4. An employee clocks in or out; server-controlled timestamps create an
   attendance record.
5. An authorized user views dashboard metrics calculated from permitted data.

## Functional requirements

### MVP

- Authentication with secure sessions and logout.
- Organization-scoped users, roles, and permissions.
- Employee profiles, departments, employment status, and deactivation.
- Search, filtering, pagination, and server-side validation for employees.
- Attendance clock-in, clock-out, history, and correction workflow.
- Leave types, balances, date validation, overlap checks, requests, approval,
  rejection reasons, cancellation, and history.
- Audit logging for authentication, authorization-sensitive changes, and
  workflow decisions.
- Responsive dashboard with loading, empty, and error states.

### Later phases

Recruitment, document management, performance management, advanced analytics,
notifications, policy search, and the AI assistant are planned but not
implemented in this phase.

## Business rules

- Every tenant-owned record has an organization boundary enforced on the
  server.
- Employees can access only their own permitted records.
- Managers can access only explicitly authorized team records.
- Leave requests require a valid date range, cannot overlap approved or
  pending requests, and cannot exceed the available balance.
- Attendance timestamps come from the server, not the client.
- Approval and rejection operations are authorized, transactional, and
  auditable.
- AI features, when introduced, may assist with drafts and summaries but may
  not independently make hiring, termination, rating, or approval decisions.

## Non-functional requirements

- Type-safe TypeScript implementation with explicit validation.
- WCAG 2.2 AA-oriented semantic UI and keyboard support.
- Secure-by-default authorization and tenant isolation.
- Database constraints and transactions for integrity-sensitive workflows.
- Automated unit, integration, and browser tests for critical journeys.
- No secrets in source control, client bundles, logs, or API responses.
- Graceful non-AI operation when an AI provider is unavailable.

## MVP acceptance criteria

- Unauthorized users cannot read or mutate another organization’s records.
- Employee CRUD and leave workflows have server-side authorization and
  validation.
- Attendance and leave dashboard metrics use authorized persisted data.
- Critical workflows have regression tests.
- The application can be installed, configured, tested, and built from a
  documented clean checkout.

## Success metrics

- 100% of protected MVP routes enforce server-side organization and role
  checks.
- Critical workflow tests pass in CI.
- No confirmed critical or high security findings remain open at release.
- HR staff can complete employee creation and leave approval without bypassing
  the application.

The current repository does not yet meet full production release acceptance:
no live database migration has run, the login limiter is process-local, and
full authenticated integration coverage requires an isolated database.

## Roadmap

1. Foundation, authentication, RBAC, and tenant isolation.
2. Employee, organization, attendance, and leave modules.
3. Recruitment and secure document management.
4. Performance management and analytics.
5. AI gateway, policy retrieval, and assistant workflows.
6. Hardening, observability, accessibility, and production readiness.
