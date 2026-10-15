import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAuthContext } from "@/lib/auth/context";
import { db } from "@/lib/db";
import { createAttendanceRepository } from "@/lib/attendance/repository";
import { clockIn, clockOut } from "@/lib/attendance/service";

const actionSchema = z.object({
  action: z.enum(["clock_in", "clock_out"]),
});

export async function GET() {
  const context = await getCurrentAuthContext();
  if (!context?.employeeId) {
    return NextResponse.json({ error: "An employee session is required." }, { status: 403 });
  }

  const records = await db.attendanceRecord.findMany({
    where: { organizationId: context.organizationId, employeeId: context.employeeId },
    orderBy: { clockInAt: "desc" },
  });
  return NextResponse.json({ attendance: records });
}

export async function POST(request: Request) {
  const context = await getCurrentAuthContext();
  if (!context?.employeeId) {
    return NextResponse.json({ error: "An employee session is required." }, { status: 403 });
  }

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid attendance action." }, { status: 400 });
  }

  const repository = createAttendanceRepository(db, context.organizationId);
  const attendance =
    parsed.data.action === "clock_in"
      ? await clockIn(repository, context, context.employeeId)
      : await clockOut(repository, context, context.employeeId);

  return NextResponse.json({ attendance }, { status: 201 });
}
