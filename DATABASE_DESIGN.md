# Database design

## Status

The initial Prisma schema is defined in `prisma/schema.prisma` and validates
with Prisma 6.12.0. No migration has been applied because no PostgreSQL server
or valuable database was authorized for this workspace.

## Initial entities

- `organizations`
- `users`
- `roles` and `permissions`
- `departments`
- `employees`
- `attendance_records`
- `leave_types`
- `leave_balances`
- `leave_requests`
- `audit_logs`

The first schema slice implements organizations, users, sessions, departments,
employees, audit logs, attendance records, leave types, leave balances, and
leave requests.

Every tenant-owned entity will include an `organization_id` foreign key.

## Integrity rules

- Use UUID primary keys and foreign keys with deliberate delete behavior.
- Add organization-scoped unique constraints where applicable, such as
  employee number and department name.
- Index organization, status, date, and foreign-key columns used by list
  queries.
- Store timestamps in UTC and convert only at the presentation boundary.
- Use a transaction and concurrency-safe update when approving leave or
  changing a balance.
- Store audit actor, organization, action, target, timestamp, and a
  non-sensitive metadata payload.

The first migration will be reviewed before it is applied to any valuable
database.
