// Simple in-memory login throttle. Per-key (IP+username) attempt counting with
// lockout. In-memory is fine for a single-box appliance; a multi-node deployment
// would move this to shared storage.

interface Bucket {
  fails: number;
  firstAt: number;
  lockedUntil: number;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILS = 5;
const LOCK_MS = 5 * 60 * 1000; // 5 minute lockout

const buckets = new Map<string, Bucket>();

export interface RateResult {
  allowed: boolean;
  retryAfterSec: number;
}

export function checkRate(key: string): RateResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b) return { allowed: true, retryAfterSec: 0 };
  if (b.lockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((b.lockedUntil - now) / 1000) };
  }
  if (now - b.firstAt > WINDOW_MS) {
    buckets.delete(key);
    return { allowed: true, retryAfterSec: 0 };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.firstAt > WINDOW_MS) {
    buckets.set(key, { fails: 1, firstAt: now, lockedUntil: 0 });
    return;
  }
  b.fails += 1;
  if (b.fails >= MAX_FAILS) {
    b.lockedUntil = now + LOCK_MS;
  }
}

export function recordSuccess(key: string): void {
  buckets.delete(key);
}
