export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type Attempt = {
  count: number;
  resetAt: number;
};

export type RateLimiter = {
  check(key: string, now?: number): RateLimitResult;
  reset(key: string): void;
};

export function createRateLimiter(
  maxAttempts: number,
  windowMs: number,
): RateLimiter {
  if (maxAttempts < 1 || windowMs < 1) {
    throw new Error("Rate-limit configuration must be positive.");
  }

  const attempts = new Map<string, Attempt>();

  return {
    check(key, now = Date.now()) {
      const current = attempts.get(key);
      if (!current || current.resetAt <= now) {
        attempts.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
      }

      if (current.count >= maxAttempts) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((current.resetAt - now) / 1000),
          ),
        };
      }

      current.count += 1;
      return { allowed: true, retryAfterSeconds: 0 };
    },
    reset(key) {
      attempts.delete(key);
    },
  };
}
