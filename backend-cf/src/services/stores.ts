import type {
  BusinessHourRow,
  Env,
  MenuRow,
  NearbyStoreResult,
  ScheduleExceptionRow,
  StoreCategory,
  StoreLocationRow,
  StoreRow,
} from '../types';
import { haversineMeters, isLocationStale } from './distance';

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
    });
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
