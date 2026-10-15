import type { PrismaClient, UserRole } from "@prisma/client";

import { hashSessionToken, type SessionRepository } from "./session";
import type { AuthContext } from "./types";
import type {
  EmployeeInput,
  EmployeeRepository,
  EmployeeUpdate,
} from "../employees/service";

export function createSessionRepository(db: PrismaClient): SessionRepository {
  return {
    async create(data) {
      return db.session.create({ data });
    },
    async findByTokenHash(tokenHash) {
      return db.session.findUnique({ where: { tokenHash } });
    },
    async deleteById(id) {
      await db.session.delete({ where: { id } });
    },
  };
}

export function createUserRepository(db: PrismaClient) {
  return {
    findByEmail: (organizationId: string, email: string) =>
      db.user.findUnique({
        where: { organizationId_email: { organizationId, email } },
        include: { employee: { select: { id: true } } },
      }),
    findAuthContextById: async (
      userId: string,
      organizationId: string,
    ): Promise<AuthContext | null> => {
      const user = await db.user.findFirst({
        where: { id: userId, organizationId, isActive: true },
        include: { employee: { select: { id: true } } },
      });

      if (!user) return null;

      return {
        userId: user.id,
        organizationId: user.organizationId,
        role: user.role,
        employeeId: user.employee?.id ?? null,
      };
    },
  };
}

export type LoginUser = {
  id: string;
  organizationId: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  employee: { id: string } | null;
};

export function toLoginUser(user: LoginUser): LoginUser {
  return user;
}

export function getSessionTokenHash(token: string): string {
  return hashSessionToken(token);
}

export function createEmployeeRepository(db: PrismaClient): EmployeeRepository {
  const map = (record: Awaited<ReturnType<typeof db.employee.findFirst>>) => {
    if (!record) return null;
    return {
      id: record.id,
      organizationId: record.organizationId,
      employeeNumber: record.employeeNumber,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      departmentId: record.departmentId,
      jobTitle: record.jobTitle,
      hiredAt: record.hiredAt,
      status: record.status,
      deactivatedAt: record.deactivatedAt,
    };
  };

  return {
    async list(organizationId) {
      const records = await db.employee.findMany({
        where: { organizationId },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      });
      return records.map((record) => map(record)!);
    },
    async findById(organizationId, employeeId) {
      return map(
        await db.employee.findFirst({
          where: { organizationId, id: employeeId },
        }),
      );
    },
    async create(organizationId, input: EmployeeInput) {
      return map(
        await db.employee.create({
          data: {
            organizationId,
            ...input,
            departmentId: input.departmentId ?? null,
            jobTitle: input.jobTitle ?? null,
            hiredAt: input.hiredAt ?? null,
          },
        }),
      )!;
    },
    async update(
      organizationId,
      employeeId,
      input: EmployeeUpdate,
    ) {
      return map(
        await db.employee.update({
          where: { id: employeeId },
          data: input,
        }),
      )!;
    },
  };
}
