import type { PrismaClient } from "@prisma/client";

import type { AttendanceRepository } from "./service";

export function createAttendanceRepository(
  db: PrismaClient,
  organizationId: string,
): AttendanceRepository {
  return {
    async findOpen(employeeId) {
      return db.attendanceRecord.findFirst({
        where: { organizationId, employeeId, status: "OPEN" },
      });
    },
    async create(data) {
      return db.attendanceRecord.create({ data });
    },
    async complete(id, clockOutAt) {
      return db.attendanceRecord.update({
        where: { id },
        data: { clockOutAt, status: "COMPLETE" },
      });
    },
    async requestCorrection(id, correctionNote) {
      return db.attendanceRecord.update({
        where: { id },
        data: { correctionNote, status: "CORRECTION_REQUESTED" },
      });
    },
    async list(_organizationId, employeeId) {
      return db.attendanceRecord.findMany({
        where: { organizationId, employeeId },
        orderBy: { clockInAt: "desc" },
      });
    },
  };
}
