/**
 * In-memory sliding-window rate limiter. Per-IP, per-route.
 *
 * Resets on server restart — that's fine for our anti-spam goal where the
 * worst case is a brief burst window. For multi-instance deployments this
 * should be swapped for a KV-backed limiter, but for a single Vercel/Node
 * instance it's plenty.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_HITS = 4;       // 4 comment posts per IP per minute
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_HITS_PER_DAY = 30;

export function rateLimitOk(ip: string): { ok: true } | { ok: false; reason: string } {
  const now = Date.now();
  const bucket = buckets.get(ip) ?? { hits: [] };
  // Drop hits older than 1 day.
  bucket.hits = bucket.hits.filter((t) => now - t < DAY_MS);

  const inWindow = bucket.hits.filter((t) => now - t < WINDOW_MS).length;
  if (inWindow >= MAX_HITS) {
    return { ok: false, reason: "Too many comments in the last minute. Slow down." };
  }
  if (bucket.hits.length >= MAX_HITS_PER_DAY) {
    return { ok: false, reason: "Daily comment limit reached. Try again tomorrow." };
  }

  bucket.hits.push(now);
  buckets.set(ip, bucket);
  return { ok: true };
}

export function getClientIp(headers: Headers): string {
  // Vercel / Cloudflare style headers, with a sensible fallback.
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
