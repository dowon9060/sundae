import type { Env } from '../types';

export async function listRegistrationRequests(
  env: Env,
  opts: { status?: string; page?: number; limit?: number } = {}
) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 50));
  const offset = (page - 1) * limit;

  const where: string[] = [];
  const binds: (string | number)[] = [];

  if (opts.status) {
    where.push(`status = ?`);
    binds.push(opts.status);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM store_registration_requests ${whereSql}`
  )
    .bind(...binds)
    .first<{ total: number }>();

  const rows = await env.DB.prepare(
    `SELECT
      id, name, menu, today_hours, location_text, lat, lng,
      CASE WHEN photo_menu IS NOT NULL THEN 1 ELSE 0 END AS has_photo_menu,
      CASE WHEN photo_location IS NOT NULL THEN 1 ELSE 0 END AS has_photo_location,
      CASE WHEN photo_truck IS NOT NULL THEN 1 ELSE 0 END AS has_photo_truck,
      status, created_at, notified_at
     FROM store_registration_requests
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`
  )
    .bind(...binds, limit, offset)
    .all<{
      id: string;
      name: string;
      menu: string;
      today_hours: string;
      location_text: string;
      lat: number | null;
      lng: number | null;
      has_photo_menu: number;
      has_photo_location: number;
      has_photo_truck: number;
      status: string;
      created_at: string;
      notified_at: string | null;
    }>();

  return {
    items: (rows.results ?? []).map((r) => ({
      ...r,
      has_photo_menu: Boolean(r.has_photo_menu),
      has_photo_location: Boolean(r.has_photo_location),
      has_photo_truck: Boolean(r.has_photo_truck),
    })),
    total: Number(countRow?.total ?? 0),
    page,
    limit,
  };
}
