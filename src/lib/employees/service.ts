import { z } from "zod";

import {
  assertEmployeeAccess,
  assertOrganizationAccess,
  assertPermission,
  AuthorizationError,
} from "../auth/policy";
import type { AuthContext } from "../auth/types";

export const employeeInputSchema = z.object({
  employeeNumber: z.string().trim().min(1).max(50),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  departmentId: z.string().uuid().nullable().optional(),
  jobTitle: z.string().trim().max(150).nullable().optional(),
  hiredAt: z.coerce.date().nullable().optional(),
});

export type EmployeeInput = z.infer<typeof employeeInputSchema>;

export type EmployeeRecord = {
    organizationId: string;
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    departmentId: string | null;
    jobTitle: string | null;
    hiredAt: Date | null;
    status: "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "TERMINATED";
    deactivatedAt: Date | null;
  };

export type EmployeeRepository = {
  list(organizationId: string): Promise<EmployeeRecord[]>;
  findById(
    organizationId: string,
    employeeId: string,
  ): Promise<EmployeeRecord | null>;
  create(
    organizationId: string,
    input: EmployeeInput,
  ): Promise<EmployeeRecord>;
  update(
    organizationId: string,
    employeeId: string,
    input: EmployeeUpdate,
  ): Promise<EmployeeRecord>;
};

export type EmployeeUpdate = Partial<EmployeeInput> & {
  status?: EmployeeRecord["status"];
  deactivatedAt?: Date | null;
};

const adminRoles = new Set(["SUPER_ADMIN", "HR_ADMIN", "HR_STAFF"]);

function assertAdmin(context: AuthContext, permission: "employee:read" | "employee:write") {
  assertPermission(context, permission);
  if (!adminRoles.has(context.role)) {
    throw new AuthorizationError("You do not have permission for this action.");
  }
}

export async function listEmployees(
  repository: EmployeeRepository,
  context: AuthContext,
): Promise<EmployeeRecord[]> {
  assertAdmin(context, "employee:read");
  return repository.list(context.organizationId);
}

export async function getEmployee(
  repository: EmployeeRepository,
  context: AuthContext,
  employeeId: string,
): Promise<EmployeeRecord> {
  const employee = await repository.findById(context.organizationId, employeeId);
  if (!employee) {
    throw new AuthorizationError("The requested resource is not available.");
  }

  assertEmployeeAccess(context, {
    organizationId: employee.organizationId,
    employeeId: employee.id,
  });
  return employee;
}

export async function createEmployee(
  repository: EmployeeRepository,
  context: AuthContext,
  input: unknown,
): Promise<EmployeeRecord> {
  assertAdmin(context, "employee:write");
  const parsed = employeeInputSchema.parse(input);
  assertOrganizationAccess(context, { organizationId: context.organizationId });
  return repository.create(context.organizationId, parsed);
}

export async function updateEmployee(
  repository: EmployeeRepository,
  context: AuthContext,
  employeeId: string,
  input: unknown,
): Promise<EmployeeRecord> {
  assertAdmin(context, "employee:write");
  const existing = await getEmployee(repository, context, employeeId);
  const parsed = employeeInputSchema.partial().parse(input);
  return repository.update(existing.organizationId, existing.id, parsed);
}

export async function deactivateEmployee(
  repository: EmployeeRepository,
  context: AuthContext,
  employeeId: string,
): Promise<EmployeeRecord> {
  assertAdmin(context, "employee:write");
  const existing = await getEmployee(repository, context, employeeId);
  return repository.update(existing.organizationId, existing.id, {
    status: "INACTIVE",
    deactivatedAt: new Date(),
  });
}
