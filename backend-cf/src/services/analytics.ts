import type { Env } from '../types';

/** Asia/Seoul 기준 YYYY-MM-DD */
export function kstDay(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** KST day 문자열에서 days-1 일 전 (시리즈 시작일) */
export function kstDayOffset(day: string, offsetDays: number): string {
  const [y, m, d] = day.split('-').map(Number);
  // KST 정오 UTC 근사로 날짜 산술 (DST 없는 서울)
  const utc = Date.UTC(y, m - 1, d - offsetDays, 3, 0, 0);
  return kstDay(new Date(utc));
}

export async function recordAppOpen(
  env: Env,
  clientId: string
): Promise<{ day: string }> {
  const day = kstDay();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO app_daily_actives (day, client_id, first_seen_at, last_seen_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(day, client_id) DO UPDATE SET
       last_seen_at = excluded.last_seen_at`
  )
    .bind(day, clientId, now, now)
    .run();

  return { day };
}

export interface AnalyticsOverview {
  today: string;
  today_dau: number;
  mau_30d: number;
  days: number;
  series: { day: string; dau: number }[];
}

export async function getAnalyticsOverview(
  env: Env,
  days = 30
): Promise<AnalyticsOverview> {
  const clamped = Math.min(90, Math.max(1, Math.floor(days)));
  const today = kstDay();
  const start = kstDayOffset(today, clamped - 1);

  const todayRow = await env.DB.prepare(
    `SELECT COUNT(*) AS cnt FROM app_daily_actives WHERE day = ?`
  )
    .bind(today)
    .first<{ cnt: number }>();

  const mauStart = kstDayOffset(today, 29);
  const mauRow = await env.DB.prepare(
    `SELECT COUNT(DISTINCT client_id) AS cnt
     FROM app_daily_actives
     WHERE day >= ? AND day <= ?`
  )
    .bind(mauStart, today)
    .first<{ cnt: number }>();

  const seriesRows = await env.DB.prepare(
    `SELECT day, COUNT(*) AS dau
     FROM app_daily_actives
     WHERE day >= ? AND day <= ?
     GROUP BY day
     ORDER BY day ASC`
  )
    .bind(start, today)
    .all<{ day: string; dau: number }>();

  const byDay = new Map<string, number>();
  for (const row of seriesRows.results ?? []) {
    byDay.set(row.day, Number(row.dau) || 0);
  }

  const series: { day: string; dau: number }[] = [];
  for (let i = clamped - 1; i >= 0; i -= 1) {
    const day = kstDayOffset(today, i);
    series.push({ day, dau: byDay.get(day) ?? 0 });
  }

  return {
    today,
    today_dau: Number(todayRow?.cnt) || 0,
    mau_30d: Number(mauRow?.cnt) || 0,
    days: clamped,
    series,
  };
}
