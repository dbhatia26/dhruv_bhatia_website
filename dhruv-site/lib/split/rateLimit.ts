/**
 * Server-only: a simple in-memory sliding-window rate limiter.
 *
 * Deliberately not backed by Redis or a database table: Running Tab is a
 * small, unlisted, friends-and-family tool, not a public high-traffic
 * service, so this is sized to the actual threat (a naive script spamming
 * junk groups), not a sophisticated distributed attacker. The real
 * limitation: on Vercel each serverless instance has its own memory, so a
 * client hitting different warm instances gets a higher effective limit
 * than the numbers below suggest, and the map resets on every cold start.
 * If real abuse shows up, move this to Postgres or Upstash Redis instead.
 */
import { SplitError } from "./types";

export class RateLimitError extends SplitError {
  constructor(message = "Too many requests. Try again in a few minutes.") {
    super(message);
    this.name = "RateLimitError";
  }
}

const attempts = new Map<string, number[]>();

/** Keeps the map from growing without bound on a long-lived warm instance. */
function prune(now: number, windowMs: number) {
  if (attempts.size < 5000) return;
  for (const [key, timestamps] of attempts) {
    const kept = timestamps.filter((t) => now - t < windowMs);
    if (kept.length === 0) attempts.delete(key);
    else attempts.set(key, kept);
  }
}

export function checkRateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  prune(now, windowMs);

  const timestamps = (attempts.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) {
    attempts.set(key, timestamps);
    throw new RateLimitError();
  }
  timestamps.push(now);
  attempts.set(key, timestamps);
}

/** Vercel sets x-forwarded-for; falls back to a shared bucket locally, where there's no proxy. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
