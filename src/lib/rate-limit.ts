type Bucket = {
  windowStart: number;
  count: number;
};

type Rule = {
  limit: number;
  windowMs: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, rule: Rule) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= rule.windowMs) {
    buckets.set(key, { windowStart: now, count: 1 });
    return { allowed: true, remaining: rule.limit - 1 };
  }

  if (existing.count >= rule.limit) {
    const resetAt = existing.windowStart + rule.windowMs;
    return { allowed: false, remaining: 0, resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: rule.limit - existing.count };
}
