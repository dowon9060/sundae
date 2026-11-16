import type {
  BusinessHourRow,
  BusinessStatus,
  Env,
  MenuRow,
  NearbyStoreResult,
  ScheduleExceptionRow,
  StoreCategory,
  StoreLocationRow,
  StoreRow,
  StoreStatus,
} from '../types';
import { haversineMeters, isLocationStale } from './distance';
import { getLikedStoreIds } from './likes';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** Workers UTC 기준 → 한국(Asia/Seoul) 요일·날짜 */
function seoulCalendar() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const weekday = get('weekday'); // Sun Mon ...
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    dayOfWeek: dayMap[weekday] ?? 0,
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

type StoreWithLocation = StoreRow & {
  lat: number;
  lng: number;
  address: string;
  location_note: string | null;
  location_updated_at: string;
};

export async function listNearbyStores(
  env: Env,
  opts: {
    lat: number;
    lng: number;
    category?: StoreCategory | 'all';
    radiusM?: number;
    /** 0=일 … 6=토. 해당 요일 운영(휴무 아님)만 반환 */
    dayOfWeek?: number;
    excludeStale?: boolean;
    /** 기기 클라이언트 ID — 있으면 liked 여부 포함 */
    clientId?: string;
  }
): Promise<NearbyStoreResult[]> {
  const staleDays = Number(env.LOCATION_STALE_DAYS || '14');
  const radiusM = opts.radiusM ?? 5000;
  const seoul = seoulCalendar();
  const dayOfWeek =
    opts.dayOfWeek != null && opts.dayOfWeek >= 0 && opts.dayOfWeek <= 6
      ? opts.dayOfWeek
      : seoul.dayOfWeek;
  const isSelectedToday = dayOfWeek === seoul.dayOfWeek;
  const dayLabel = DAY_LABELS[dayOfWeek];

  let query = `
    SELECT
      s.*,
      l.lat,
      l.lng,
      l.address,
      l.location_note,
      l.updated_at AS location_updated_at
    FROM stores s
    INNER JOIN store_locations l ON l.store_id = s.id
    WHERE s.status = 'active'
  `;
  const binds: (string | number)[] = [];

  if (opts.category && opts.category !== 'all') {
    query += ` AND s.category = ?`;
    binds.push(opts.category);
  }

  const rows = await env.DB.prepare(query)
    .bind(...binds)
    .all<StoreWithLocation>();

  const results: NearbyStoreResult[] = [];

  for (const row of rows.results ?? []) {
    const distance_m = Math.round(
      haversineMeters(opts.lat, opts.lng, row.lat, row.lng)
    );
    if (distance_m > radiusM) continue;

    const location_stale = isLocationStale(row.location_updated_at, staleDays);
    if (opts.excludeStale && location_stale) continue;

    const hour = await env.DB.prepare(
      `SELECT open_time, close_time, is_closed
       FROM business_hours
       WHERE store_id = ? AND day_of_week = ?`
    )
      .bind(row.id, dayOfWeek)
      .first<{ open_time: string | null; close_time: string | null; is_closed: number }>();

    let exception: {
      is_closed: number;
      open_time: string | null;
      close_time: string | null;
    } | null = null;

    if (isSelectedToday) {
      exception =
        (await env.DB.prepare(
          `SELECT is_closed, open_time, close_time
           FROM schedule_exceptions
           WHERE store_id = ? AND date = ?`
        )
          .bind(row.id, seoul.dateStr)
          .first<{
            is_closed: number;
            open_time: string | null;
            close_time: string | null;
          }>()) ?? null;
    }

    // 요일 탭은 그날 운영시간을 보여 주기 위함 — 휴무도 목록에 포함
    let is_closed_on_day = false;
    let today_hours_label: string | null = null;

    if (exception) {
      if (exception.is_closed || !exception.open_time || !exception.close_time) {
        is_closed_on_day = true;
        today_hours_label = `${dayLabel} 휴무`;
      } else {
        today_hours_label = `${dayLabel} ${exception.open_time}~${exception.close_time}`;
      }
    } else if (!hour || hour.is_closed || !hour.open_time || !hour.close_time) {
      is_closed_on_day = true;
      today_hours_label = `${dayLabel} 휴무`;
    } else {
      today_hours_label = `${dayLabel} ${hour.open_time}~${hour.close_time}`;
    }

    const menuSummary = await env.DB.prepare(
      `SELECT GROUP_CONCAT(name, ' · ') AS summary
       FROM (
         SELECT name FROM menus
         WHERE store_id = ? AND is_available = 1
         ORDER BY sort_order ASC
         LIMIT 3
       )`
    )
      .bind(row.id)
      .first<{ summary: string | null }>();

    results.push({
      ...row,
      distance_m,
      location_stale,
      menu_summary: menuSummary?.summary ?? null,
      today_hours_label,
      is_closed_on_day,
      like_count: Number(row.like_count ?? 0),
    });
  }

  if (opts.clientId && results.length > 0) {
    try {
      const likedIds = await getLikedStoreIds(
        env,
        opts.clientId,
        results.map((r) => r.id)
      );
      for (const item of results) {
        item.liked = likedIds.has(item.id);
      }
    } catch (err) {
      // likes 테이블 미적용 등으로 목록 전체가 500 나지 않게 한다
      console.error(
        JSON.stringify({
          level: 'warn',
          message: 'liked_lookup_failed',
          detail: err instanceof Error ? err.message : 'unknown',
        })
      );
      for (const item of results) {
        item.liked = false;
      }
    }
  }

  // 운영 중인 곳 우선, 같은 그룹 안에서는 거리순
  results.sort((a, b) => {
    if (a.is_closed_on_day !== b.is_closed_on_day) {
      return a.is_closed_on_day ? 1 : -1;
    }
    return a.distance_m - b.distance_m;
  });
  return results;
}

export async function getStoreById(
  env: Env,
  id: string,
  userLat?: number,
  userLng?: number
) {
  const staleDays = Number(env.LOCATION_STALE_DAYS || '14');
  const row = await env.DB.prepare(
    `SELECT
      s.*,
      l.lat,
      l.lng,
      l.address,
      l.location_note,
      l.updated_at AS location_updated_at
    FROM stores s
    INNER JOIN store_locations l ON l.store_id = s.id
    WHERE s.id = ?`
  )
    .bind(id)
    .first<StoreWithLocation>();

  if (!row) return null;

  let distance_m: number | null = null;
  if (userLat != null && userLng != null) {
    distance_m = Math.round(haversineMeters(userLat, userLng, row.lat, row.lng));
  }

  return {
    ...row,
    distance_m,
    location_stale: isLocationStale(row.location_updated_at, staleDays),
  };
}

export async function getMenus(env: Env, storeId: string): Promise<MenuRow[]> {
  const result = await env.DB.prepare(
    `SELECT * FROM menus WHERE store_id = ? ORDER BY sort_order ASC, id ASC`
  )
    .bind(storeId)
    .all<MenuRow>();
  return result.results ?? [];
}

export async function getHours(env: Env, storeId: string) {
  const hours = await env.DB.prepare(
    `SELECT * FROM business_hours WHERE store_id = ? ORDER BY day_of_week ASC`
  )
    .bind(storeId)
    .all<BusinessHourRow>();

  const todayStr = new Date().toISOString().slice(0, 10);
  const exception = await env.DB.prepare(
    `SELECT * FROM schedule_exceptions WHERE store_id = ? AND date = ?`
  )
    .bind(storeId, todayStr)
    .first<ScheduleExceptionRow>();

  return {
    hours: (hours.results ?? []).map((h) => ({
      ...h,
      day_label: DAY_LABELS[h.day_of_week],
      is_closed: Boolean(h.is_closed),
    })),
    today_exception: exception
      ? {
          ...exception,
          is_closed: Boolean(exception.is_closed),
        }
      : null,
  };
}

export async function updateStoreLocation(
  env: Env,
  storeId: string,
  body: {
    lat: number;
    lng: number;
    address: string;
    location_note?: string | null;
  }
) {
  const existing = await env.DB.prepare(
    `SELECT store_id FROM store_locations WHERE store_id = ?`
  )
    .bind(storeId)
    .first<StoreLocationRow>();

  if (!existing) {
    await env.DB.prepare(
      `INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    )
      .bind(
        storeId,
        body.lat,
        body.lng,
        body.address,
        body.location_note ?? null
      )
      .run();
  } else {
    await env.DB.prepare(
      `UPDATE store_locations
       SET lat = ?, lng = ?, address = ?, location_note = ?, updated_at = datetime('now')
       WHERE store_id = ?`
    )
      .bind(
        body.lat,
        body.lng,
        body.address,
        body.location_note ?? null,
        storeId
      )
      .run();
  }

  return env.DB.prepare(`SELECT * FROM store_locations WHERE store_id = ?`)
    .bind(storeId)
    .first<StoreLocationRow>();
}

export async function updateStoreHours(
  env: Env,
  storeId: string,
  hours: Array<{
    day_of_week: number;
    open_time?: string | null;
    close_time?: string | null;
    is_closed: boolean;
  }>
) {
  for (const h of hours) {
    await env.DB.prepare(
      `INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(store_id, day_of_week) DO UPDATE SET
         open_time = excluded.open_time,
         close_time = excluded.close_time,
         is_closed = excluded.is_closed`
    )
      .bind(
        storeId,
        h.day_of_week,
        h.is_closed ? null : h.open_time ?? null,
        h.is_closed ? null : h.close_time ?? null,
        h.is_closed ? 1 : 0
      )
      .run();
  }

  return getHours(env, storeId);
}

/** 시·도 접두 (address LIKE 필터용) */
export const KOREA_REGIONS = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '강원도',
  '충청북도',
  '충청남도',
  '전북특별자치도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
] as const;

export type AdminStoreListItem = StoreRow & {
  lat: number | null;
  lng: number | null;
  address: string | null;
  location_note: string | null;
  location_updated_at: string | null;
  region: string | null;
  menu_summary: string | null;
};

function extractRegion(address: string | null | undefined): string | null {
  if (!address) return null;
  for (const region of KOREA_REGIONS) {
    if (address.startsWith(region)) return region;
  }
  const first = address.trim().split(/\s+/)[0];
  return first || null;
}

export async function listAdminStores(
  env: Env,
  opts: {
    region?: string;
    category?: StoreCategory;
    status?: StoreStatus;
    q?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ items: AdminStoreListItem[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 50));
  const offset = (page - 1) * limit;

  const where: string[] = [];
  const binds: (string | number)[] = [];

  if (opts.region) {
    where.push(`l.address LIKE ?`);
    binds.push(`${opts.region}%`);
  }
  if (opts.category) {
    where.push(`s.category = ?`);
    binds.push(opts.category);
  }
  if (opts.status) {
    where.push(`s.status = ?`);
    binds.push(opts.status);
  }
  if (opts.q) {
    where.push(`s.name LIKE ?`);
    binds.push(`%${opts.q}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) AS total
     FROM stores s
     LEFT JOIN store_locations l ON l.store_id = s.id
     ${whereSql}`
  )
    .bind(...binds)
    .first<{ total: number }>();

  const total = Number(countRow?.total ?? 0);

  const rows = await env.DB.prepare(
    `SELECT
      s.*,
      l.lat,
      l.lng,
      l.address,
      l.location_note,
      l.updated_at AS location_updated_at,
      (
        SELECT GROUP_CONCAT(name, ' · ')
        FROM (
          SELECT name FROM menus
          WHERE store_id = s.id AND is_available = 1
          ORDER BY sort_order ASC
          LIMIT 3
        )
      ) AS menu_summary
     FROM stores s
     LEFT JOIN store_locations l ON l.store_id = s.id
     ${whereSql}
     ORDER BY s.created_at DESC
     LIMIT ? OFFSET ?`
  )
    .bind(...binds, limit, offset)
    .all<
      StoreRow & {
        lat: number | null;
        lng: number | null;
        address: string | null;
        location_note: string | null;
        location_updated_at: string | null;
        menu_summary: string | null;
      }
    >();

  const items: AdminStoreListItem[] = (rows.results ?? []).map((row) => ({
    ...row,
    region: extractRegion(row.address),
    like_count: Number(row.like_count ?? 0),
  }));

  return { items, total, page, limit };
}

export async function getAdminStoreDetail(env: Env, id: string) {
  const store = await getStoreById(env, id);
  if (!store) return null;
  const menus = await getMenus(env, id);
  const hoursData = await getHours(env, id);
  return {
    ...store,
    region: extractRegion(store.address),
    menus,
    hours: hoursData.hours,
    today_exception: hoursData.today_exception,
  };
}

export type CreateStoreInput = {
  name: string;
  category: StoreCategory;
  lat: number;
  lng: number;
  address: string;
  description?: string | null;
  photo_url?: string | null;
  location_note?: string | null;
  business_status?: BusinessStatus;
  status?: StoreStatus;
  menus?: Array<{ name: string; price: number; photo_url?: string | null }>;
  hours?: Array<{
    day_of_week: number;
    open_time?: string | null;
    close_time?: string | null;
    is_closed: boolean;
  }>;
};

export async function createStore(env: Env, input: CreateStoreInput) {
  const id = `store-${crypto.randomUUID()}`;
  const businessStatus = input.business_status ?? 'unknown';
  const status = input.status ?? 'active';

  await env.DB.prepare(
    `INSERT INTO stores (id, name, category, description, photo_url, status, business_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  )
    .bind(
      id,
      input.name.trim(),
      input.category,
      input.description?.trim() || null,
      input.photo_url?.trim() || null,
      status,
      businessStatus
    )
    .run();

  await env.DB.prepare(
    `INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`
  )
    .bind(
      id,
      input.lat,
      input.lng,
      input.address.trim(),
      input.location_note?.trim() || null
    )
    .run();

  if (input.menus?.length) {
    let sort = 0;
    for (const menu of input.menus) {
      const name = menu.name?.trim();
      if (!name) continue;
      await env.DB.prepare(
        `INSERT INTO menus (store_id, name, price, photo_url, is_available, sort_order)
         VALUES (?, ?, ?, ?, 1, ?)`
      )
        .bind(id, name, Math.max(0, Math.round(menu.price) || 0), menu.photo_url ?? null, sort)
        .run();
      sort += 1;
    }
  }

  if (input.hours?.length) {
    await updateStoreHours(env, id, input.hours);
  }

  return getAdminStoreDetail(env, id);
}

export type UpdateStoreInput = {
  name?: string;
  category?: StoreCategory;
  description?: string | null;
  photo_url?: string | null;
  status?: StoreStatus;
  business_status?: BusinessStatus;
  lat?: number;
  lng?: number;
  address?: string;
  location_note?: string | null;
  menus?: Array<{ name: string; price: number; photo_url?: string | null }>;
};

export async function updateStore(
  env: Env,
  id: string,
  input: UpdateStoreInput
) {
  const existing = await env.DB.prepare(`SELECT id FROM stores WHERE id = ?`)
    .bind(id)
    .first<{ id: string }>();
  if (!existing) return null;

  const fields: string[] = [];
  const binds: (string | number | null)[] = [];

  if (input.name != null) {
    fields.push('name = ?');
    binds.push(input.name.trim());
  }
  if (input.category != null) {
    fields.push('category = ?');
    binds.push(input.category);
  }
  if (input.description !== undefined) {
    fields.push('description = ?');
    binds.push(input.description?.trim() || null);
  }
  if (input.photo_url !== undefined) {
    fields.push('photo_url = ?');
    binds.push(input.photo_url?.trim() || null);
  }
  if (input.status != null) {
    fields.push('status = ?');
    binds.push(input.status);
  }
  if (input.business_status != null) {
    fields.push('business_status = ?');
    binds.push(input.business_status);
  }

  if (fields.length) {
    await env.DB.prepare(`UPDATE stores SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...binds, id)
      .run();
  }

  const hasLocationUpdate =
    input.lat != null ||
    input.lng != null ||
    input.address != null ||
    input.location_note !== undefined;

  if (hasLocationUpdate) {
    const current = await env.DB.prepare(
      `SELECT * FROM store_locations WHERE store_id = ?`
    )
      .bind(id)
      .first<StoreLocationRow>();

    const lat = input.lat ?? current?.lat;
    const lng = input.lng ?? current?.lng;
    const address = input.address?.trim() ?? current?.address;
    const location_note =
      input.location_note !== undefined
        ? input.location_note?.trim() || null
        : current?.location_note ?? null;

    if (lat == null || lng == null || !address) {
      throw new Error('LOCATION_INCOMPLETE');
    }

    await updateStoreLocation(env, id, {
      lat,
      lng,
      address,
      location_note,
    });
  }

  if (input.menus) {
    await env.DB.prepare(`DELETE FROM menus WHERE store_id = ?`).bind(id).run();
    let sort = 0;
    for (const menu of input.menus) {
      const name = menu.name?.trim();
      if (!name) continue;
      await env.DB.prepare(
        `INSERT INTO menus (store_id, name, price, photo_url, is_available, sort_order)
         VALUES (?, ?, ?, ?, 1, ?)`
      )
        .bind(id, name, Math.max(0, Math.round(menu.price) || 0), menu.photo_url ?? null, sort)
        .run();
      sort += 1;
    }
  }

  return getAdminStoreDetail(env, id);
}

export async function listRegionsWithCounts(env: Env) {
  const rows = await env.DB.prepare(
    `SELECT address FROM store_locations WHERE address IS NOT NULL AND address != ''`
  ).all<{ address: string }>();

  const counts = new Map<string, number>();
  for (const row of rows.results ?? []) {
    const region = extractRegion(row.address) ?? '기타';
    counts.set(region, (counts.get(region) ?? 0) + 1);
  }

  const known = KOREA_REGIONS.map((name) => ({
    name,
    count: counts.get(name) ?? 0,
  })).filter((r) => r.count > 0);

  const knownSet = new Set<string>(KOREA_REGIONS);
  const extras = [...counts.entries()]
    .filter(([name]) => !knownSet.has(name))
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return [...known, ...extras];
}
