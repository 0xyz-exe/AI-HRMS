import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { createSessionRepository, createUserRepository } from "@/lib/auth/repositories";
import { SESSION_COOKIE } from "@/lib/auth/context";
import { createRateLimiter } from "@/lib/auth/rate-limit";

const loginSchema = z.object({
  organizationId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const loginLimiter = createRateLimiter(5, 15 * 60 * 1000);

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientKey = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const limit = loginLimiter.check(clientKey);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login request." }, { status: 400 });
  }

  const user = await createUserRepository(db).findByEmail(
    parsed.data.organizationId,
    parsed.data.email,
  );
  const validPassword = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !user.isActive || !validPassword) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const { token, session } = await createSession(
    createSessionRepository(db),
    { userId: user.id, organizationId: user.organizationId },
  );
  const response = NextResponse.json({ ok: true });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: session.expiresAt,
    path: "/",
  });
  loginLimiter.reset(clientKey);

  return response;
}
