import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth/context";
import { createEmployeeRepository } from "@/lib/auth/repositories";
import { db } from "@/lib/db";
import { createEmployee, listEmployees } from "@/lib/employees/service";

export async function GET() {
  const context = await getCurrentAuthContext();
  if (!context) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  try {
    return NextResponse.json({
      employees: await listEmployees(createEmployeeRepository(db), context),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const context = await getCurrentAuthContext();
  if (!context) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  try {
    const employee = await createEmployee(
      createEmployeeRepository(db),
      context,
      await request.json().catch(() => null),
    );
    return NextResponse.json({ employee }, { status: 201 });
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
