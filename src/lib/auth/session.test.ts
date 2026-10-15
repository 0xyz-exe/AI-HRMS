import { describe, expect, it } from "vitest";

import {
  SESSION_TTL_MS,
  createSession,
  hashSessionToken,
  isSessionExpired,
  revokeSession,
  resolveSession,
  tokensMatch,
  type SessionRecord,
  type SessionRepository,
} from "./session";

function createRepository(): SessionRepository & { records: SessionRecord[] } {
  const records: SessionRecord[] = [];

  return {
    records,
    async create(data) {
      const record = { id: `session-${records.length + 1}`, ...data };
      records.push(record);
      return record;
    },
    async findByTokenHash(tokenHash) {
      return records.find((record) => record.tokenHash === tokenHash) ?? null;
    },
    async deleteById(id) {
      const index = records.findIndex((record) => record.id === id);
      if (index >= 0) records.splice(index, 1);
    },
  };
}

describe("session helpers", () => {
  it("stores only a hash and returns a resolvable opaque token", async () => {
    const repository = createRepository();
    const now = new Date("2026-01-01T00:00:00.000Z");
    const result = await createSession(
      repository,
      { userId: "user-1", organizationId: "org-1" },
      now,
    );

    expect(result.token).not.toBe(result.session.tokenHash);
    expect(result.session.tokenHash).toBe(hashSessionToken(result.token));
    expect(result.session.expiresAt.getTime()).toBe(
      now.getTime() + SESSION_TTL_MS,
    );
    await expect(resolveSession(repository, result.token, now)).resolves.toEqual(
      result.session,
    );
  });

  it("rejects missing, invalid, and expired tokens", async () => {
    const repository = createRepository();
    const now = new Date("2026-01-01T00:00:00.000Z");
    const result = await createSession(
      repository,
      { userId: "user-1", organizationId: "org-1" },
      now,
    );

    await expect(resolveSession(repository, "", now)).resolves.toBeNull();
    await expect(resolveSession(repository, "invalid", now)).resolves.toBeNull();
    await expect(
      resolveSession(repository, result.token, result.session.expiresAt),
    ).resolves.toBeNull();
    expect(isSessionExpired(result.session.expiresAt, now)).toBe(false);
  });

  it("compares tokens without exposing plaintext equality", () => {
    expect(tokensMatch("token-a", "token-a")).toBe(true);
    expect(tokensMatch("token-a", "token-b")).toBe(false);
  });

  it("revokes an existing session and leaves unknown tokens unchanged", async () => {
    const repository = createRepository();
    const { token } = await createSession(repository, {
      userId: "user-1",
      organizationId: "org-1",
    });

    await expect(revokeSession(repository, token)).resolves.toBe(true);
    await expect(resolveSession(repository, token)).resolves.toBeNull();
    await expect(revokeSession(repository, "unknown")).resolves.toBe(false);
  });
});
