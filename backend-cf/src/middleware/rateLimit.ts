import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';

type Bucket = number[];

/** isolate 단위 메모리 버킷 (프로덕션은 CF Rate Limiting/KV로 교체 권장) */
const buckets = new Map<string, Bucket>();

const MAX_KEYS = 5000;

/** 로컬 개발용 — 버킷 초기화 */
export function clearRateLimitBuckets() {
  buckets.clear();
}

function clientIp(headers: Headers): string {
  const cf = headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
}

function prune(bucket: Bucket, windowStart: number): Bucket {
  return bucket.filter((t) => t >= windowStart);
}

function take(
  key: string,
  windowMs: number,
  max: number
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  let bucket = prune(buckets.get(key) ?? [], windowStart);

  if (bucket.length >= max) {
    const oldest = bucket[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    buckets.set(key, bucket);
    return { ok: false, retryAfterSec };
  }

  bucket.push(now);
  buckets.set(key, bucket);

  if (buckets.size > MAX_KEYS) {
    const overflow = buckets.size - MAX_KEYS;
    let removed = 0;
    for (const k of buckets.keys()) {
      buckets.delete(k);
      removed += 1;
      if (removed >= overflow) break;
    }
  }

  return { ok: true, retryAfterSec: 0 };
}

export function rateLimit(opts: {
  windowMs: number;
  max: number;
  /** 경로 prefix로 버킷 분리 */
  name: string;
}) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const ip = clientIp(c.req.raw.headers);
    const key = `${opts.name}:${ip}`;
    const result = take(key, opts.windowMs, opts.max);

    c.header('X-RateLimit-Limit', String(opts.max));

    if (!result.ok) {
      c.header('Retry-After', String(result.retryAfterSec));
      return c.json(
        {
          error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
          retry_after_sec: result.retryAfterSec,
        },
        429
      );
    }

    await next();
  });
}
