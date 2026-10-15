import { describe, expect, it } from "vitest";

import {
  assertEmployeeAccess,
  assertOrganizationAccess,
  assertPermission,
  hasPermission,
} from "./policy";
import type { AuthContext } from "./types";

const employee: AuthContext = {
  userId: "user-1",
  organizationId: "org-1",
  role: "EMPLOYEE",
  employeeId: "employee-1",
};

describe("authorization policy", () => {
  it("limits employees to their own organization and employee record", () => {
    expect(() =>
      assertEmployeeAccess(employee, {
        organizationId: "org-1",
        employeeId: "employee-1",
      }),
    ).not.toThrow();

    expect(() =>
      assertEmployeeAccess(employee, {
        organizationId: "org-1",
        employeeId: "employee-2",
      }),
    ).toThrow("not available");
  });

  it("rejects cross-tenant access for every role", () => {
    expect(() =>
      assertOrganizationAccess(employee, { organizationId: "org-2" }),
    ).toThrow("not available");
  });

  it("does not grant approval permission to employees", () => {
    expect(hasPermission(employee, "leave:approve")).toBe(false);
    expect(() => assertPermission(employee, "leave:approve")).toThrow(
      "permission",
    );
  });

  it("requires authentication before evaluating permissions", () => {
    expect(() => assertPermission(null, "employee:read")).toThrow(
      "Authentication",
    );
  });
});
