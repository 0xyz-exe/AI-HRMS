import { z } from "zod";

export const roleSchema = z.enum([
  "SUPER_ADMIN",
  "HR_ADMIN",
  "HR_STAFF",
  "MANAGER",
  "EMPLOYEE",
]);

export type Role = z.infer<typeof roleSchema>;

export const permissionSchema = z.enum([
  "organization:manage",
  "employee:read",
  "employee:write",
  "attendance:read",
  "attendance:write",
  "leave:read",
  "leave:request",
  "leave:approve",
  "audit:read",
]);

export type Permission = z.infer<typeof permissionSchema>;

export const authContextSchema = z.object({
  userId: z.string().min(1),
  organizationId: z.string().min(1),
  role: roleSchema,
  employeeId: z.string().min(1).nullable(),
});

export type AuthContext = z.infer<typeof authContextSchema>;

export type OrganizationResource = {
  organizationId: string;
};

export type EmployeeResource = OrganizationResource & {
  employeeId: string;
};
