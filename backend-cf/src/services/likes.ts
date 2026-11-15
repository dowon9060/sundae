import type { Env } from '../types';

const CLIENT_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

export function isValidClientId(raw: unknown): raw is string {
  return typeof raw === 'string' && CLIENT_ID_RE.test(raw);
}

export async function getLikedStoreIds(
  env: Env,
  clientId: string,
  storeIds: string[]
): Promise<Set<string>> {
  const liked = new Set<string>();
  if (!storeIds.length) return liked;

  // D1 바인드 한도 고려하여 청크 조회
  const chunkSize = 40;
  for (let i = 0; i < storeIds.length; i += chunkSize) {
    const chunk = storeIds.slice(i, i + chunkSize);
    const placeholders = chunk.map(() => '?').join(',');
    const rows = await env.DB.prepare(
      `SELECT store_id FROM store_likes
       WHERE client_id = ? AND store_id IN (${placeholders})`
    )
      .bind(clientId, ...chunk)
      .all<{ store_id: string }>();

    for (const row of rows.results ?? []) {
      liked.add(row.store_id);
    }
  }
  return liked;
}

export async function toggleStoreLike(
  env: Env,
  storeId: string,
  clientId: string
): Promise<{ liked: boolean; like_count: number }> {
  const store = await env.DB.prepare(
    `SELECT id, like_count FROM stores WHERE id = ? AND status = 'active'`
  )
    .bind(storeId)
    .first<{ id: string; like_count: number }>();

  if (!store) {
    throw new Error('STORE_NOT_FOUND');
  }

  const existing = await env.DB.prepare(
    `SELECT store_id FROM store_likes WHERE store_id = ? AND client_id = ?`
  )
    .bind(storeId, clientId)
    .first<{ store_id: string }>();

  if (existing) {
    await env.DB.batch([
      env.DB.prepare(
        `DELETE FROM store_likes WHERE store_id = ? AND client_id = ?`
      ).bind(storeId, clientId),
      env.DB.prepare(
        `UPDATE stores
         SET like_count = CASE WHEN like_count > 0 THEN like_count - 1 ELSE 0 END
         WHERE id = ?`
      ).bind(storeId),
    ]);

    const next = await env.DB.prepare(
      `SELECT like_count FROM stores WHERE id = ?`
    )
      .bind(storeId)
      .first<{ like_count: number }>();

    return { liked: false, like_count: next?.like_count ?? 0 };
  }

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO store_likes (store_id, client_id) VALUES (?, ?)`
    ).bind(storeId, clientId),
    env.DB.prepare(
      `UPDATE stores SET like_count = like_count + 1 WHERE id = ?`
    ).bind(storeId),
  ]);

  const next = await env.DB.prepare(
    `SELECT like_count FROM stores WHERE id = ?`
  )
    .bind(storeId)
    .first<{ like_count: number }>();

  return { liked: true, like_count: next?.like_count ?? store.like_count + 1 };
}
