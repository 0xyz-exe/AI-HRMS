import type {
  AuthContext,
  EmployeeResource,
  OrganizationResource,
  Permission,
  Role,
} from "./types";

const rolePermissions: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: [
    "organization:manage",
    "employee:read",
    "employee:write",
    "attendance:read",
    "attendance:write",
    "leave:read",
    "leave:request",
    "leave:approve",
    "audit:read",
  ],
  HR_ADMIN: [
    "employee:read",
    "employee:write",
    "attendance:read",
    "attendance:write",
    "leave:read",
    "leave:request",
    "leave:approve",
    "audit:read",
  ],
  HR_STAFF: [
    "employee:read",
    "employee:write",
    "attendance:read",
    "leave:read",
    "leave:request",
    "leave:approve",
  ],
  MANAGER: [
    "employee:read",
    "attendance:read",
    "leave:read",
    "leave:approve",
  ],
  EMPLOYEE: [
    "employee:read",
    "attendance:read",
    "attendance:write",
    "leave:read",
    "leave:request",
  ],
};

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function hasPermission(
  context: AuthContext,
  permission: Permission,
): boolean {
  return rolePermissions[context.role].includes(permission);
}

export function assertAuthenticated(
  context: AuthContext | null | undefined,
): asserts context is AuthContext {
  if (!context) {
    throw new AuthorizationError("Authentication is required.");
  }
}

export function assertPermission(
  context: AuthContext | null | undefined,
  permission: Permission,
): asserts context is AuthContext {
  assertAuthenticated(context);

  if (!hasPermission(context, permission)) {
    throw new AuthorizationError("You do not have permission for this action.");
  }
}

export function assertOrganizationAccess(
  context: AuthContext | null | undefined,
  resource: OrganizationResource,
): asserts context is AuthContext {
  assertAuthenticated(context);

  if (context.organizationId !== resource.organizationId) {
    throw new AuthorizationError("The requested resource is not available.");
  }
}

export function assertEmployeeAccess(
  context: AuthContext | null | undefined,
  resource: EmployeeResource,
): asserts context is AuthContext {
  assertOrganizationAccess(context, resource);

  if (
    context.role === "EMPLOYEE" &&
    context.employeeId !== resource.employeeId
  ) {
    throw new AuthorizationError("The requested resource is not available.");
  }
}
