import type { PrismaClient } from "@prisma/client";

import type {
  LeaveRepository,
  LeaveRequest,
} from "./service";

export function createLeaveRepository(
  db: PrismaClient,
  organizationId: string,
): LeaveRepository {
  const map = (record: {
    id: string;
    organizationId: string;
    employeeId: string;
    leaveTypeId: string;
    startDate: Date;
    endDate: Date;
    days: number;
    reason: string | null;
    status: LeaveRequest["status"];
    rejectionReason: string | null;
  }): LeaveRequest => ({
    id: record.id,
    organizationId: record.organizationId,
    employeeId: record.employeeId,
    leaveTypeId: record.leaveTypeId,
    startDate: record.startDate,
    endDate: record.endDate,
    days: record.days,
    reason: record.reason,
    status: record.status,
    rejectionReason: record.rejectionReason,
  });

  return {
    async listForEmployee(employeeId) {
      const records = await db.leaveRequest.findMany({
        where: { organizationId, employeeId },
        orderBy: { startDate: "desc" },
      });
      return records.map(map);
    },
    async findById(id) {
      const record = await db.leaveRequest.findFirst({
        where: { organizationId, id },
      });
      return record ? map(record) : null;
    },
    async getBalance(employeeId, leaveTypeId, year) {
      return db.leaveBalance.findUnique({
        where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year } },
        select: { employeeId: true, leaveTypeId: true, year: true, allocatedDays: true, usedDays: true },
      });
    },
    async create(input) {
      return map(await db.leaveRequest.create({ data: input }));
    },
    async approve(id, approverId) {
      return db.$transaction(async (transaction) => {
        const request = await transaction.leaveRequest.findFirstOrThrow({
          where: { organizationId, id, status: "PENDING" },
        });
        const balance = await transaction.leaveBalance.findUniqueOrThrow({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: request.employeeId,
              leaveTypeId: request.leaveTypeId,
              year: request.startDate.getUTCFullYear(),
            },
          },
        });
        if (balance.allocatedDays - balance.usedDays < request.days) {
          throw new Error("Insufficient leave balance.");
        }
        await transaction.leaveBalance.update({
          where: { id: balance.id },
          data: { usedDays: { increment: request.days } },
        });
        return map(await transaction.leaveRequest.update({
          where: { id: request.id },
          data: { status: "APPROVED", approverId },
        }));
      });
    },
    async reject(id, approverId, reason) {
      return map(await db.leaveRequest.update({
        where: { id },
        data: { status: "REJECTED", approverId, rejectionReason: reason },
      }));
    },
    async cancel(id) {
      return map(await db.leaveRequest.update({
        where: { id },
        data: { status: "CANCELLED" },
      }));
    },
  };
}
