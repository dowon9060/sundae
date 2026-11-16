import type { Env } from '../types';

export async function getVerifiedStoreIds(
  env: Env,
  clientId: string,
  storeIds: string[]
): Promise<Set<string>> {
  const verified = new Set<string>();
  if (!storeIds.length) return verified;

  const chunkSize = 40;
  try {
    for (let i = 0; i < storeIds.length; i += chunkSize) {
      const chunk = storeIds.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => '?').join(',');
      const rows = await env.DB.prepare(
        `SELECT store_id FROM store_verifications
         WHERE client_id = ? AND store_id IN (${placeholders})`
      )
        .bind(clientId, ...chunk)
        .all<{ store_id: string }>();

      for (const row of rows.results ?? []) {
        verified.add(row.store_id);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('no such table')) {
      return verified;
    }
    throw err;
  }
  return verified;
}

/**
 * 현장 인증. 기기당 1회만 카운트에 반영한다.
 * 이미 인증한 경우 verified=true 와 현재 수만 반환한다.
 */
export async function verifyStore(
  env: Env,
  storeId: string,
  clientId: string
): Promise<{ verified: boolean; verify_count: number; already: boolean }> {
  const store = await env.DB.prepare(
    `SELECT id, COALESCE(verify_count, 0) AS verify_count
     FROM stores WHERE id = ? AND status = 'active'`
  )
    .bind(storeId)
    .first<{ id: string; verify_count: number }>();

  if (!store) {
    throw new Error('STORE_NOT_FOUND');
  }

  const existing = await env.DB.prepare(
    `SELECT store_id FROM store_verifications WHERE store_id = ? AND client_id = ?`
  )
    .bind(storeId, clientId)
    .first<{ store_id: string }>();

  if (existing) {
    return {
      verified: true,
      verify_count: Number(store.verify_count) || 0,
      already: true,
    };
  }

  try {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO store_verifications (store_id, client_id) VALUES (?, ?)`
      ).bind(storeId, clientId),
      env.DB.prepare(
        `UPDATE stores SET verify_count = COALESCE(verify_count, 0) + 1 WHERE id = ?`
      ).bind(storeId),
    ]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // 동시 요청으로 UNIQUE 충돌 시 현재 값 반환
    if (msg.toLowerCase().includes('unique')) {
      const next = await env.DB.prepare(
        `SELECT COALESCE(verify_count, 0) AS verify_count FROM stores WHERE id = ?`
      )
        .bind(storeId)
        .first<{ verify_count: number }>();
      return {
        verified: true,
        verify_count: Number(next?.verify_count) || 0,
        already: true,
      };
    }
    throw err;
  }

  const next = await env.DB.prepare(
    `SELECT COALESCE(verify_count, 0) AS verify_count FROM stores WHERE id = ?`
  )
    .bind(storeId)
    .first<{ verify_count: number }>();

  return {
    verified: true,
    verify_count: Number(next?.verify_count) || Number(store.verify_count) + 1,
    already: false,
  };
}
