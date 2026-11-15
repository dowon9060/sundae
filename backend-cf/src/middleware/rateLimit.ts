import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';

type Bucket = number[];

/** isolate 단위 메모리 버킷 (GET 등 가벼운 요청용) */
const buckets = new Map<string, Bucket>();

const MAX_KEYS = 5000;

/** 로컬 개발용 — 메모리 버킷 초기화 */
export function clearRateLimitBuckets() {
  buckets.clear();
}

export function clientIp(headers: Headers): string {
  const cf = headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
}

function prune(bucket: Bucket, windowStart: number): Bucket {
  return bucket.filter((t) => t >= windowStart);
}

function takeMemory(
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

/** D1 기반 — 쓰기 API용 (isolate/PoP 간 공유) */
async function takeDurable(
  db: D1Database,
  key: string,
  windowMs: number,
  max: number
): Promise<{ ok: boolean; retryAfterSec: number }> {
  const now = Date.now();
  const windowStart = now - windowMs;

  // 오래된 히트 정리 (해당 키만)
  await db
    .prepare(`DELETE FROM rate_limit_hits WHERE bucket_key = ? AND hit_at < ?`)
    .bind(key, windowStart)
    .run();

  const row = await db
    .prepare(
      `SELECT COUNT(*) AS cnt, MIN(hit_at) AS oldest
       FROM rate_limit_hits
       WHERE bucket_key = ? AND hit_at >= ?`
    )
    .bind(key, windowStart)
    .first<{ cnt: number; oldest: number | null }>();

  const cnt = Number(row?.cnt ?? 0);
  if (cnt >= max) {
    const oldest = Number(row?.oldest ?? now);
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  await db
    .prepare(`INSERT INTO rate_limit_hits (bucket_key, hit_at) VALUES (?, ?)`)
    .bind(key, now)
    .run();

  return { ok: true, retryAfterSec: 0 };
}

export function rateLimit(opts: {
  windowMs: number;
  max: number;
  /** 경로 prefix로 버킷 분리 */
  name: string;
  /** true면 D1 durable 제한 (등록·제보·좋아요 등) */
  durable?: boolean;
}) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const ip = clientIp(c.req.raw.headers);
    const key = `${opts.name}:${ip}`;

    let result: { ok: boolean; retryAfterSec: number };
    if (opts.durable) {
      try {
        result = await takeDurable(c.env.DB, key, opts.windowMs, opts.max);
      } catch (err) {
        // 마이그레이션 전·일시 오류 시 메모리 폴백 (가용성 우선)
        console.error(
          JSON.stringify({
            level: 'warn',
            message: 'durable_rate_limit_fallback',
            detail: err instanceof Error ? err.message : 'unknown',
          })
        );
        result = takeMemory(key, opts.windowMs, opts.max);
      }
    } else {
      result = takeMemory(key, opts.windowMs, opts.max);
    }

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
