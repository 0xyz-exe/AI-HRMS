import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth/context";
import { createEmployeeRepository } from "@/lib/auth/repositories";
import { db } from "@/lib/db";
import {
  deactivateEmployee,
  getEmployee,
  updateEmployee,
} from "@/lib/employees/service";

type RouteContext = { params: Promise<{ employeeId: string }> };

async function contextOrUnauthorized() {
  const context = await getCurrentAuthContext();
  return context
    ? { context }
    : { response: NextResponse.json({ error: "Authentication is required." }, { status: 401 }) };
}

export async function GET(_request: Request, routeContext: RouteContext) {
  const auth = await contextOrUnauthorized();
  if ("response" in auth) return auth.response;

  try {
    const { employeeId } = await routeContext.params;
    return NextResponse.json({
      employee: await getEmployee(createEmployeeRepository(db), auth.context, employeeId),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}

export async function PATCH(request: Request, routeContext: RouteContext) {
  const auth = await contextOrUnauthorized();
  if ("response" in auth) return auth.response;

  try {
    const { employeeId } = await routeContext.params;
    return NextResponse.json({
      employee: await updateEmployee(
        createEmployeeRepository(db),
        auth.context,
        employeeId,
        await request.json().catch(() => null),
      ),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid employee data." }, { status: 400 });
    }
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, routeContext: RouteContext) {
  const auth = await contextOrUnauthorized();
  if ("response" in auth) return auth.response;

  try {
    const { employeeId } = await routeContext.params;
    return NextResponse.json({
      employee: await deactivateEmployee(
        createEmployeeRepository(db),
        auth.context,
        employeeId,
      ),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}
