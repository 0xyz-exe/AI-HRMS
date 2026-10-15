import { describe, expect, it } from "vitest";

import { requestLeave, type LeaveRepository } from "./service";
import type { AuthContext } from "../auth/types";

const context: AuthContext = {
  userId: "u1",
  organizationId: "org-1",
  role: "EMPLOYEE",
  employeeId: "11111111-1111-4111-8111-111111111111",
};
const leaveTypeId = "22222222-2222-4222-8222-222222222222";

function repository(balance = 10): LeaveRepository {
  return {
    async listForEmployee() { return []; },
    async findById() { return null; },
    async getBalance() { return { employeeId: context.employeeId!, leaveTypeId, year: 2026, allocatedDays: balance, usedDays: 0 }; },
    async create(input) { return { id: "leave-1", ...input }; },
    async approve() { throw new Error("not used"); },
    async reject() { throw new Error("not used"); },
    async cancel() { throw new Error("not used"); },
  };
}

describe("leave service", () => {
  it("calculates inclusive days and validates balance", async () => {
    await expect(requestLeave(repository(2), context, {
      employeeId: context.employeeId,
      leaveTypeId,
      startDate: "2026-01-10",
      endDate: "2026-01-11",
    })).resolves.toMatchObject({ days: 2, status: "PENDING" });
    await expect(requestLeave(repository(1), context, {
      employeeId: context.employeeId,
      leaveTypeId,
      startDate: "2026-01-10",
      endDate: "2026-01-11",
    })).rejects.toThrow("Insufficient");
  });
});
