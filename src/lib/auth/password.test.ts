import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("hashes and verifies a valid password without storing plaintext", async () => {
    const password = "correct horse battery staple";
    const encodedHash = await hashPassword(password);

    expect(encodedHash).not.toContain(password);
    await expect(verifyPassword(password, encodedHash)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", encodedHash)).resolves.toBe(
      false,
    );
  });

  it("rejects malformed hashes and weak passwords", async () => {
    await expect(hashPassword("short")).rejects.toThrow("12 characters");
    await expect(verifyPassword("password", "not-a-valid-hash")).resolves.toBe(
      false,
    );
  });
});
