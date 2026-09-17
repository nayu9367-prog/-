import { NextRequest, NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

// Per-instance in-memory store. Vercel can run multiple isolates, so this is
// a best-effort guard against casual abuse/brute-force, not a hard global
// limit. Good enough for a small class site without adding external infra.
const buckets = new Map<string, Bucket>();

// Bound memory growth: if a deploy runs long enough to accumulate a lot of
// distinct keys, drop expired ones opportunistically.
function sweepExpired(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Fixed-window rate limit. Returns a 429 response when `name`+client IP has
 * exceeded `limit` requests within `windowMs`, otherwise null.
 */
export function rateLimit(
  request: NextRequest,
  name: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now();
  sweepExpired(now);

  const key = `${name}:${getClientIp(request)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }

  return null;
}
