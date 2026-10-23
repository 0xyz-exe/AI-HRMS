# AI HRMS

AI-powered Human Resources Management System focused on secure,
organization-scoped HR operations.

Repository: https://github.com/0xyz-exe/AI-HRMS

## Screenshots

### HR Analytics & Employee Directory
![Employee directory](docs/screenshots/01_employee_directory.png)

### Attendance & Time Tracking
![Attendance](docs/screenshots/02_attendance.png)

### Leave Request & Approval Workflow
![Leave management](docs/screenshots/03_leave_management.png)

### AI Candidate Evaluation & Insights
![AI evaluations](docs/screenshots/04_ai_evaluations.png)

### Organization Settings & Role-Based Access Control
![Settings](docs/screenshots/05_settings.png)

## Project status

The repository has completed its requirements, authentication, authorization,
employee, attendance, and leave API foundation. The MVP is defined in
[PRD.md](./PRD.md). A live database migration and browser E2E execution remain
environment-dependent release gates.

The unauthenticated health check is available at
`GET /api/health`.

## Planned stack

Next.js, React, TypeScript, PostgreSQL, Prisma, Zod, Tailwind CSS, Vitest,
React Testing Library, and Playwright. See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Local commands

```text
npm run dev
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

The Playwright smoke test requires Chromium to be launchable in the host
environment. Its result is recorded in [TEST_REPORT.md](./TEST_REPORT.md).

## Documentation

- [PRD](./PRD.md)
- [Architecture](./ARCHITECTURE.md)
- [Database design](./DATABASE_DESIGN.md)
- [API contract](./API.md)
- [UI/UX brief](./UI_UX_BRIEF.md)
- [Security audit](./SECURITY_AUDIT.md)
- [Test report](./TEST_REPORT.md)
- [Contributing](./CONTRIBUTING.md)

## Environment

Copy `.env.example` to `.env.local` when implementation begins. Never commit
real credentials.

## Database

The initial PostgreSQL schema is defined in [prisma/schema.prisma](./prisma/schema.prisma).
After
starting a local PostgreSQL instance and setting `DATABASE_URL`, review and
create a development migration with:

```text
npx prisma migrate dev --name initial_auth_and_tenant_schema
```

Do not run this command against production or a database containing valuable
data without an approved backup and migration review.
