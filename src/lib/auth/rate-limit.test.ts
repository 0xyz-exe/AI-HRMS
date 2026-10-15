import { describe, expect, it } from "vitest";

import { createRateLimiter } from "./rate-limit";

describe("rate limiter", () => {
  it("blocks after the configured attempts and resets after the window", () => {
    const limiter = createRateLimiter(2, 1000);

    expect(limiter.check("ip", 0).allowed).toBe(true);
    expect(limiter.check("ip", 1).allowed).toBe(true);
    expect(limiter.check("ip", 2)).toMatchObject({ allowed: false });
    expect(limiter.check("ip", 1000).allowed).toBe(true);
  });

  it("keeps keys isolated and supports explicit reset", () => {
    const limiter = createRateLimiter(1, 1000);

    expect(limiter.check("one", 0).allowed).toBe(true);
    expect(limiter.check("two", 0).allowed).toBe(true);
    limiter.reset("one");
    expect(limiter.check("one", 1).allowed).toBe(true);
  });
});
