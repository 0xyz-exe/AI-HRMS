import { cookies } from "next/headers";

import {
  createSessionRepository,
  createUserRepository,
} from "./repositories";
import { resolveSession } from "./session";
import { db } from "@/lib/db";
import { authContextSchema, type AuthContext } from "./types";

export const SESSION_COOKIE = "ai_hrms_session";

export async function getCurrentAuthContext(): Promise<AuthContext | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await resolveSession(createSessionRepository(db), token);
  if (!session) return null;

  const context = await createUserRepository(db).findAuthContextById(
    session.userId,
    session.organizationId,
  );

  return context ? authContextSchema.parse(context) : null;
}
