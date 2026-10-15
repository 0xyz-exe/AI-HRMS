import { describe, expect, it } from "vitest";

import { clockIn, clockOut, type AttendanceRecord, type AttendanceRepository } from "./service";
import type { AuthContext } from "../auth/types";

const context: AuthContext = {
  userId: "u1",
  organizationId: "org-1",
  role: "EMPLOYEE",
  employeeId: "emp-1",
};

function repository(): AttendanceRepository {
  let record: AttendanceRecord | null = null;
  return {
    async findOpen() {
      return record?.status === "OPEN" ? record : null;
    },
    async create(data) {
      record = { id: "attendance-1", ...data };
      return record;
    },
    async complete(id, clockOutAt) {
      record = { ...record!, id, clockOutAt, status: "COMPLETE" };
      return record;
    },
    async requestCorrection(id, correctionNote) {
      record = { ...record!, id, correctionNote, status: "CORRECTION_REQUESTED" };
      return record;
    },
    async list() {
      return record ? [record] : [];
    },
  };
}

describe("attendance service", () => {
  it("uses supplied server time and requires a valid clock-out", async () => {
    const repo = repository();
    const clockInAt = new Date("2026-01-01T09:00:00Z");
    await clockIn(repo, context, "emp-1", clockInAt);
    await expect(clockIn(repo, context, "emp-1", clockInAt)).rejects.toThrow("already");
    await expect(clockOut(repo, context, "emp-1", new Date("2026-01-01T08:00:00Z"))).rejects.toThrow("after");
    await expect(clockOut(repo, context, "emp-1", new Date("2026-01-01T17:00:00Z"))).resolves.toMatchObject({ status: "COMPLETE" });
  });
});
