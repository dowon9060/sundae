import type { Env } from '../types';

/** 클라이언트 축소 후 기준. 무료 티어 저장량을 아끼기 위해 2MB로 제한 */
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const PHOTO_PATH_PREFIX = '/photos/';

/**
 * Cloudflare R2 무료 한도(월): 저장 10GB / Class A 100만 / Class B 1000만.
 * 여유를 두고 80%에서 차단한다.
 */
export const R2_FREE_STORAGE_BYTES = 8 * 1024 * 1024 * 1024;
export const R2_FREE_CLASS_A_PER_MONTH = 800_000;

const KEY_RE = /^stores\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

type PhotoType = { ext: 'jpg' | 'png' | 'webp'; mime: string };

type UsageRow = {
  total_bytes: number;
  month_key: string;
  month_class_a: number;
  month_class_b: number;
};

/** Content-Type 헤더가 아닌 실제 파일 시그니처로 판별 */
function detectPhotoType(bytes: Uint8Array): PhotoType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { ext: 'png', mime: 'image/png' };
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  ) {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
}

export function isValidPhotoKey(key: string): boolean {
  return KEY_RE.test(key);
}

function seoulMonthKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  return `${year}-${month}`;
}

async function readUsage(env: Env): Promise<UsageRow> {
  const row = await env.DB.prepare(
    `SELECT total_bytes, month_key, month_class_a, month_class_b FROM r2_usage WHERE id = 1`
  ).first<UsageRow>();
  return (
    row ?? {
      total_bytes: 0,
      month_key: '',
      month_class_a: 0,
      month_class_b: 0,
    }
  );
}

function normalizeMonth(row: UsageRow, monthKey: string): UsageRow {
  if (row.month_key === monthKey) return row;
  return {
    total_bytes: row.total_bytes,
    month_key: monthKey,
    month_class_a: 0,
    month_class_b: 0,
  };
}

/** 업로드 전 무료 한도 검사 후 저장·사용량 반영 */
export async function savePhoto(
  env: Env,
  body: ArrayBuffer,
  origin: string,
  uploadedBy: string
): Promise<{ key: string; url: string }> {
  if (body.byteLength === 0) throw new Error('EMPTY_PHOTO');
  if (body.byteLength > MAX_PHOTO_BYTES) throw new Error('PHOTO_TOO_LARGE');

  const type = detectPhotoType(new Uint8Array(body, 0, Math.min(body.byteLength, 16)));
  if (!type) throw new Error('INVALID_PHOTO_TYPE');

  if (!env.PHOTOS) throw new Error('PHOTOS_NOT_CONFIGURED');

  const monthKey = seoulMonthKey();
  const usage = normalizeMonth(await readUsage(env), monthKey);
  const nextBytes = usage.total_bytes + body.byteLength;
  if (nextBytes > R2_FREE_STORAGE_BYTES) throw new Error('R2_STORAGE_QUOTA');
  if (usage.month_class_a + 1 > R2_FREE_CLASS_A_PER_MONTH) {
    throw new Error('R2_CLASS_A_QUOTA');
  }

  const key = `stores/${crypto.randomUUID()}.${type.ext}`;
  await env.PHOTOS.put(key, body, {
    httpMetadata: {
      contentType: type.mime,
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: { uploadedBy },
  });

  await env.DB.prepare(
    `INSERT INTO r2_usage (id, total_bytes, month_key, month_class_a, month_class_b, updated_at)
     VALUES (1, ?, ?, 1, 0, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       total_bytes = r2_usage.total_bytes + excluded.total_bytes,
       month_key = excluded.month_key,
       month_class_a = CASE
         WHEN r2_usage.month_key = excluded.month_key THEN r2_usage.month_class_a + 1
         ELSE 1
       END,
       month_class_b = CASE
         WHEN r2_usage.month_key = excluded.month_key THEN r2_usage.month_class_b
         ELSE 0
       END,
       updated_at = datetime('now')`
  )
    .bind(body.byteLength, monthKey)
    .run();

  return { key, url: `${origin}${PHOTO_PATH_PREFIX}${key}` };
}

/**
 * 공개 이미지 조회.
 * Class B(읽기)는 요청마다 D1에 쓰면 D1 무료 쓰기 한도를 먼저 소진하므로
 * 계측하지 않는다. 장기 캐시(Cache-Control)로 R2 읽기를 줄인다.
 */
export async function getPhotoObject(
  env: Env,
  key: string
): Promise<R2ObjectBody | null> {
  if (!env.PHOTOS) return null;
  if (!isValidPhotoKey(key)) return null;
  return env.PHOTOS.get(key);
}
