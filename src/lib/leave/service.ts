import { z } from "zod";

import { assertEmployeeAccess, assertPermission, AuthorizationError } from "../auth/policy";
import type { AuthContext } from "../auth/types";

export const leaveRequestInputSchema = z.object({
  employeeId: z.string().uuid(),
  leaveTypeId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().trim().max(1000).nullable().optional(),
});

export type LeaveRequestInput = z.infer<typeof leaveRequestInputSchema>;
export type LeaveRequest = LeaveRequestInput & {
  id: string;
  organizationId: string;
  days: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason: string | null;
};
export type LeaveBalance = {
  employeeId: string;
  leaveTypeId: string;
  year: number;
  allocatedDays: number;
  usedDays: number;
};
export type LeaveRepository = {
  listForEmployee(employeeId: string): Promise<LeaveRequest[]>;
  findById(id: string): Promise<LeaveRequest | null>;
  getBalance(employeeId: string, leaveTypeId: string, year: number): Promise<LeaveBalance | null>;
  create(input: Omit<LeaveRequest, "id">): Promise<LeaveRequest>;
  approve(id: string, approverId: string): Promise<LeaveRequest>;
  reject(id: string, approverId: string, reason: string): Promise<LeaveRequest>;
  cancel(id: string): Promise<LeaveRequest>;
};

function dayCount(startDate: Date, endDate: Date): number {
  const start = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
  const end = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  return Math.floor((end - start) / 86_400_000) + 1;
}

function overlaps(a: LeaveRequest, startDate: Date, endDate: Date): boolean {
  return a.status === "PENDING" || a.status === "APPROVED"
    ? a.startDate <= endDate && a.endDate >= startDate
    : false;
}

export async function requestLeave(
  repository: LeaveRepository,
  context: AuthContext,
  input: unknown,
) {
  assertPermission(context, "leave:request");
  const parsed = leaveRequestInputSchema.parse(input);
  assertEmployeeAccess(context, { organizationId: context.organizationId, employeeId: parsed.employeeId });
  if (parsed.endDate < parsed.startDate) throw new Error("End date must be on or after start date.");
  const days = dayCount(parsed.startDate, parsed.endDate);
  const year = parsed.startDate.getUTCFullYear();
  const balance = await repository.getBalance(parsed.employeeId, parsed.leaveTypeId, year);
  if (!balance || balance.allocatedDays - balance.usedDays < days) {
    throw new Error("Insufficient leave balance.");
  }
  if ((await repository.listForEmployee(parsed.employeeId)).some((request) => overlaps(request, parsed.startDate, parsed.endDate))) {
    throw new Error("Leave dates overlap an existing request.");
  }
  return repository.create({
    ...parsed,
    organizationId: context.organizationId,
    endDate: parsed.endDate,
    startDate: parsed.startDate,
    reason: parsed.reason ?? null,
    days,
    status: "PENDING",
    rejectionReason: null,
  });
}

export async function approveLeave(repository: LeaveRepository, context: AuthContext, request: LeaveRequest) {
  assertPermission(context, "leave:approve");
  if (context.organizationId !== request.organizationId) throw new AuthorizationError("The requested resource is not available.");
  if (request.status !== "PENDING") throw new Error("Only pending leave can be approved.");
  return repository.approve(request.id, context.userId);
}

export async function rejectLeave(repository: LeaveRepository, context: AuthContext, request: LeaveRequest, reason: string) {
  assertPermission(context, "leave:approve");
  if (context.organizationId !== request.organizationId) throw new AuthorizationError("The requested resource is not available.");
  if (request.status !== "PENDING") throw new Error("Only pending leave can be rejected.");
  if (!reason.trim()) throw new Error("A rejection reason is required.");
  return repository.reject(request.id, context.userId, reason.trim());
}

export async function cancelLeave(repository: LeaveRepository, context: AuthContext, request: LeaveRequest) {
  assertPermission(context, "leave:request");
  assertEmployeeAccess(context, { organizationId: request.organizationId, employeeId: request.employeeId });
  if (request.status !== "PENDING") throw new Error("Only pending leave can be cancelled.");
  return repository.cancel(request.id);
}
