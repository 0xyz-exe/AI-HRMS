import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth/context";

export async function GET() {
  const context = await getCurrentAuthContext();

  if (!context) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  return NextResponse.json({ user: context });
}
