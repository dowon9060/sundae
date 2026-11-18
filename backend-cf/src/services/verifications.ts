import type { Env } from '../types';
import { haversineMeters } from './distance';
import { seoulCalendar } from './seoulTime';

/** 판매점 등록 좌표에서 이 거리 안에서만 현장 인증할 수 있다 */
export const VERIFY_RADIUS_M = 300;

const CHUNK_SIZE = 40;

function isMissingTable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('no such table');
}

/** 오늘(서울) 이 기기가 인증한 판매점 */
export async function getVerifiedStoreIds(
  env: Env,
  clientId: string,
  storeIds: string[]
): Promise<Set<string>> {
  const verified = new Set<string>();
  if (!storeIds.length) return verified;

  const day = seoulCalendar().dateStr;
  try {
    for (let i = 0; i < storeIds.length; i += CHUNK_SIZE) {
      const chunk = storeIds.slice(i, i + CHUNK_SIZE);
      const placeholders = chunk.map(() => '?').join(',');
      const rows = await env.DB.prepare(
        `SELECT store_id FROM store_daily_verifications
         WHERE day = ? AND client_id = ? AND store_id IN (${placeholders})`
      )
        .bind(day, clientId, ...chunk)
        .all<{ store_id: string }>();

      for (const row of rows.results ?? []) {
        verified.add(row.store_id);
      }
    }
  } catch (err) {
    if (isMissingTable(err)) return verified;
    throw err;
  }
  return verified;
}

/** 오늘(서울) 판매점별 인증 수 */
export async function getTodayVerifyCounts(
  env: Env,
  storeIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!storeIds.length) return counts;

  const day = seoulCalendar().dateStr;
  try {
    for (let i = 0; i < storeIds.length; i += CHUNK_SIZE) {
      const chunk = storeIds.slice(i, i + CHUNK_SIZE);
      const placeholders = chunk.map(() => '?').join(',');
      const rows = await env.DB.prepare(
        `SELECT store_id, COUNT(*) AS c FROM store_daily_verifications
         WHERE day = ? AND store_id IN (${placeholders})
         GROUP BY store_id`
      )
        .bind(day, ...chunk)
        .all<{ store_id: string; c: number }>();

      for (const row of rows.results ?? []) {
        counts.set(row.store_id, Number(row.c) || 0);
      }
    }
  } catch (err) {
    if (isMissingTable(err)) return counts;
    throw err;
  }
  return counts;
}

export type VerifyResult = {
  verified: boolean;
  /** 누적 인증 수 */
  verify_count: number;
  /** 오늘(서울) 인증 수 */
  today_verify_count: number;
  already: boolean;
  distance_m: number;
};

/**
 * 현장 인증. 판매점 300m 이내에서 기기당 하루 1회만 반영한다.
 * 오늘 이미 인증한 경우 verified=true 와 현재 수만 반환한다.
 * @throws STORE_NOT_FOUND | TOO_FAR:{distance_m}
 */
export async function verifyStore(
  env: Env,
  storeId: string,
  clientId: string,
  coords: { lat: number; lng: number }
): Promise<VerifyResult> {
  const store = await env.DB.prepare(
    `SELECT s.id, COALESCE(s.verify_count, 0) AS verify_count, l.lat, l.lng
     FROM stores s
     INNER JOIN store_locations l ON l.store_id = s.id
     WHERE s.id = ? AND s.status = 'active'`
  )
    .bind(storeId)
    .first<{ id: string; verify_count: number; lat: number; lng: number }>();

  if (!store) {
    throw new Error('STORE_NOT_FOUND');
  }

  const distance_m = Math.round(
    haversineMeters(coords.lat, coords.lng, store.lat, store.lng)
  );
  if (distance_m > VERIFY_RADIUS_M) {
    throw new Error(`TOO_FAR:${distance_m}`);
  }

  const day = seoulCalendar().dateStr;

  const readCounts = async () => {
    const [total, today] = await Promise.all([
      env.DB.prepare(
        `SELECT COALESCE(verify_count, 0) AS verify_count FROM stores WHERE id = ?`
      )
        .bind(storeId)
        .first<{ verify_count: number }>(),
      env.DB.prepare(
        `SELECT COUNT(*) AS c FROM store_daily_verifications
         WHERE store_id = ? AND day = ?`
      )
        .bind(storeId, day)
        .first<{ c: number }>(),
    ]);
    return {
      verify_count: Number(total?.verify_count) || 0,
      today_verify_count: Number(today?.c) || 0,
    };
  };

  const existing = await env.DB.prepare(
    `SELECT store_id FROM store_daily_verifications
     WHERE store_id = ? AND client_id = ? AND day = ?`
  )
    .bind(storeId, clientId, day)
    .first<{ store_id: string }>();

  if (existing) {
    return { verified: true, already: true, distance_m, ...(await readCounts()) };
  }

  try {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO store_daily_verifications (store_id, client_id, day, distance_m)
         VALUES (?, ?, ?, ?)`
      ).bind(storeId, clientId, day, distance_m),
      env.DB.prepare(
        `UPDATE stores SET verify_count = COALESCE(verify_count, 0) + 1 WHERE id = ?`
      ).bind(storeId),
    ]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // 동시 요청으로 PK 충돌 시 현재 값 반환
    if (msg.toLowerCase().includes('unique') || msg.includes('PRIMARY KEY')) {
      return { verified: true, already: true, distance_m, ...(await readCounts()) };
    }
    throw err;
  }

  return { verified: true, already: false, distance_m, ...(await readCounts()) };
}
