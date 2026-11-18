/** Workers UTC 기준 → 한국(Asia/Seoul) 요일·날짜·시각 */
export function seoulCalendar(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

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

  const hour = Number(get('hour'));
  const minute = Number(get('minute'));

  return {
    dayOfWeek: dayMap[weekday] ?? 0,
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
    /** 0~1439 (24:00은 1440으로 취급하지 않음 — 시각은 0~23시) */
    minutesOfDay:
      (Number.isFinite(hour) ? hour : 0) * 60 +
      (Number.isFinite(minute) ? minute : 0),
  };
}

/** "HH:MM" 또는 "24:00" → 분. 잘못되면 null */
export function parseTimeToMinutes(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || min < 0 || min > 59) {
    return null;
  }
  if (h === 24 && min === 0) return 24 * 60;
  if (h < 0 || h > 23) return null;
  return h * 60 + min;
}

/**
 * 등록된 운영시간 기준 "지금 영업 중" 여부.
 * 자정을 넘는 구간은 close=24:00 만 지원한다.
 */
export function isOpenAtMinutes(
  openTime: string | null | undefined,
  closeTime: string | null | undefined,
  minutesOfDay: number
): boolean {
  const open = parseTimeToMinutes(openTime);
  const close = parseTimeToMinutes(closeTime);
  if (open == null || close == null) return false;
  if (close <= open) return false;
  return minutesOfDay >= open && minutesOfDay < close;
}
