import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { revokeSession } from "@/lib/auth/session";
import { createSessionRepository } from "@/lib/auth/repositories";
import { SESSION_COOKIE } from "@/lib/auth/context";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await revokeSession(createSessionRepository(db), token);
  }

  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
