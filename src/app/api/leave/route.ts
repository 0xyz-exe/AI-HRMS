import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth/context";
import { createLeaveRepository } from "@/lib/leave/repository";
import { db } from "@/lib/db";
import { requestLeave } from "@/lib/leave/service";

export async function GET() {
  const context = await getCurrentAuthContext();
  if (!context?.employeeId) {
    return NextResponse.json({ error: "An employee session is required." }, { status: 403 });
  }
  const requests = await db.leaveRequest.findMany({
    where: { organizationId: context.organizationId, employeeId: context.employeeId },
    orderBy: { startDate: "desc" },
  });
  const balances = await db.leaveBalance.findMany({
    where: { organizationId: context.organizationId, employeeId: context.employeeId },
  });
  return NextResponse.json({ requests, balances });
}

export async function POST(request: Request) {
  const context = await getCurrentAuthContext();
  if (!context) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }
  try {
    const leave = await requestLeave(
      createLeaveRepository(db, context.organizationId),
      context,
      await request.json().catch(() => null),
    );
    return NextResponse.json({ leave }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid leave request." }, { status: 400 });
    }
    if (error instanceof Error && (error.name === "AuthorizationError" || error.message.includes("balance") || error.message.includes("overlap") || error.message.includes("date"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
