import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth/context";
import { db } from "@/lib/db";

export async function GET() {
  const context = await getCurrentAuthContext();
  if (!context) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }
  const departments = await db.department.findMany({
    where: { organizationId: context.organizationId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ departments });
}
