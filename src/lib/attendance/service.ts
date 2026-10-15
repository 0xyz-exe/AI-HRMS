import { assertEmployeeAccess, assertPermission, AuthorizationError } from "../auth/policy";
import type { AuthContext } from "../auth/types";

export type AttendanceRecord = {
  id: string;
  organizationId: string;
  employeeId: string;
  clockInAt: Date;
  clockOutAt: Date | null;
  status: "OPEN" | "COMPLETE" | "CORRECTION_REQUESTED";
  correctionNote: string | null;
};

export type AttendanceRepository = {
  findOpen(employeeId: string): Promise<AttendanceRecord | null>;
  create(data: Omit<AttendanceRecord, "id">): Promise<AttendanceRecord>;
  complete(id: string, clockOutAt: Date): Promise<AttendanceRecord>;
  requestCorrection(id: string, note: string): Promise<AttendanceRecord>;
  list(organizationId: string, employeeId: string): Promise<AttendanceRecord[]>;
};

export async function clockIn(
  repository: AttendanceRepository,
  context: AuthContext,
  employeeId: string,
  now: Date = new Date(),
) {
  assertPermission(context, "attendance:write");
  assertEmployeeAccess(context, { organizationId: context.organizationId, employeeId });
  if (await repository.findOpen(employeeId)) {
    throw new AuthorizationError("An open attendance record already exists.");
  }
  return repository.create({
    organizationId: context.organizationId,
    employeeId,
    clockInAt: now,
    clockOutAt: null,
    status: "OPEN",
    correctionNote: null,
  });
}

export async function clockOut(
  repository: AttendanceRepository,
  context: AuthContext,
  employeeId: string,
  now: Date = new Date(),
) {
  assertPermission(context, "attendance:write");
  assertEmployeeAccess(context, { organizationId: context.organizationId, employeeId });
  const open = await repository.findOpen(employeeId);
  if (!open) throw new AuthorizationError("No open attendance record exists.");
  if (now <= open.clockInAt) {
    throw new AuthorizationError("Clock-out must be after clock-in.");
  }
  return repository.complete(open.id, now);
}

export async function requestCorrection(
  repository: AttendanceRepository,
  context: AuthContext,
  record: AttendanceRecord,
  note: string,
) {
  assertPermission(context, "attendance:write");
  assertEmployeeAccess(context, record);
  if (!note.trim()) throw new Error("A correction note is required.");
  return repository.requestCorrection(record.id, note.trim());
}
