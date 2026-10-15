import { describe, expect, it } from "vitest";

import {
  createEmployee,
  getEmployee,
  listEmployees,
  type EmployeeRecord,
  type EmployeeRepository,
} from "./service";
import type { AuthContext } from "../auth/types";

const admin: AuthContext = {
  userId: "user-1",
  organizationId: "org-1",
  role: "HR_ADMIN",
  employeeId: null,
};

const employeeUser: AuthContext = {
  userId: "user-2",
  organizationId: "org-1",
  role: "EMPLOYEE",
  employeeId: "employee-own",
};

function repository(): EmployeeRepository {
  const records: EmployeeRecord[] = [];
  return {
    async list(organizationId) {
      return records.filter((record) => record.organizationId === organizationId);
    },
    async findById(organizationId, employeeId) {
      return (
        records.find(
          (record) =>
            record.organizationId === organizationId && record.id === employeeId,
        ) ?? null
      );
    },
    async create(organizationId, input) {
      const record: EmployeeRecord = {
        ...input,
        id: `employee-${records.length + 1}`,
        organizationId,
        departmentId: input.departmentId ?? null,
        jobTitle: input.jobTitle ?? null,
        hiredAt: input.hiredAt ?? null,
        status: "ACTIVE",
        deactivatedAt: null,
      };
      records.push(record);
      return record;
    },
    async update(organizationId, employeeId, input) {
      const index = records.findIndex(
        (record) =>
          record.organizationId === organizationId && record.id === employeeId,
      );
      records[index] = { ...records[index], ...input };
      return records[index];
    },
  };
}

describe("employee service", () => {
  it("allows HR administrators to create and list employees", async () => {
    const repo = repository();
    await createEmployee(repo, admin, {
      employeeNumber: "E-001",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    });

    await expect(listEmployees(repo, admin)).resolves.toHaveLength(1);
  });

  it("prevents employees from listing the organization", async () => {
    await expect(listEmployees(repository(), employeeUser)).rejects.toThrow(
      "permission",
    );
  });

  it("prevents an employee from reading another employee", async () => {
    const repo = repository();
    const created = await createEmployee(repo, admin, {
      employeeNumber: "E-002",
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
    });

    await expect(getEmployee(repo, employeeUser, created.id)).rejects.toThrow(
      "not available",
    );
  });

  it("rejects invalid employee input", async () => {
    await expect(
      createEmployee(repoForTest(), admin, {
        employeeNumber: "",
        firstName: "A",
        lastName: "B",
        email: "not-an-email",
      }),
    ).rejects.toThrow();
  });
});

function repoForTest(): EmployeeRepository {
  return repository();
}
