import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import type { AuthContext } from "./types";

export const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

export type SessionRecord = {
  id: string;
  userId: string;
  organizationId: string;
  tokenHash: string;
  expiresAt: Date;
};

export type SessionRepository = {
  create(data: Omit<SessionRecord, "id">): Promise<SessionRecord>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  deleteById(id: string): Promise<void>;
};

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function tokensMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(hashSessionToken(left), "hex");
  const rightBuffer = Buffer.from(hashSessionToken(right), "hex");

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function isSessionExpired(
  expiresAt: Date,
  now: Date = new Date(),
): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export async function createSession(
  repository: SessionRepository,
  user: Pick<AuthContext, "userId" | "organizationId">,
  now: Date = new Date(),
): Promise<{ token: string; session: SessionRecord }> {
  const token = createSessionToken();
  const session = await repository.create({
    userId: user.userId,
    organizationId: user.organizationId,
    tokenHash: hashSessionToken(token),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });

  return { token, session };
}

export async function resolveSession(
  repository: SessionRepository,
  token: string,
  now: Date = new Date(),
): Promise<SessionRecord | null> {
  if (!token) {
    return null;
  }

  const session = await repository.findByTokenHash(hashSessionToken(token));

  if (!session || isSessionExpired(session.expiresAt, now)) {
    return null;
  }

  return session;
}

export async function revokeSession(
  repository: SessionRepository,
  token: string,
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const session = await repository.findByTokenHash(hashSessionToken(token));

  if (!session) {
    return false;
  }

  await repository.deleteById(session.id);
  return true;
}
