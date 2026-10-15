import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAuthContext } from "@/lib/auth/context";
import { createLeaveRepository } from "@/lib/leave/repository";
import { db } from "@/lib/db";
import { approveLeave, cancelLeave, rejectLeave } from "@/lib/leave/service";

const actionSchema = z.object({
  action: z.enum(["approve", "reject", "cancel"]),
  reason: z.string().optional(),
});

export async function PATCH(
  request: Request,
  routeContext: { params: Promise<{ requestId: string }> },
) {
  const context = await getCurrentAuthContext();
  if (!context) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid leave action." }, { status: 400 });
  }
  const { requestId } = await routeContext.params;
  const repository = createLeaveRepository(db, context.organizationId);
  const leave = await repository.findById(requestId);
  if (!leave) {
    return NextResponse.json({ error: "The requested resource is not available." }, { status: 404 });
  }

  try {
    const result =
      parsed.data.action === "approve"
        ? await approveLeave(repository, context, leave)
        : parsed.data.action === "reject"
          ? await rejectLeave(repository, context, leave, parsed.data.reason ?? "")
          : await cancelLeave(repository, context, leave);
    return NextResponse.json({ leave: result });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
