import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth/context";
import { db } from "@/lib/db";

export async function GET() {
  const context = await getCurrentAuthContext();
  if (!context) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }
  const [employeeCount, attendanceOpen, leavePending] = await Promise.all([
    db.employee.count({ where: { organizationId: context.organizationId } }),
    db.attendanceRecord.count({ where: { organizationId: context.organizationId, status: "OPEN" } }),
    db.leaveRequest.count({ where: { organizationId: context.organizationId, status: "PENDING" } }),
  ]);
  return NextResponse.json({ employeeCount, attendanceOpen, leavePending });
}
