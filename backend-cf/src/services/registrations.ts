import type { Env, StoreCategory } from '../types';
import { notifyStoreRegistration } from './notify';

/** base64 data URL 기준 대략 150KB 이미지 */
const MAX_PHOTO_CHARS = 200_000;
const MAX_NAME = 80;
const MAX_MENU = 500;
const MAX_TODAY_HOURS = 80;
const MAX_LOCATION = 200;
const DATA_IMAGE_RE = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=\s]+$/i;

const STORE_CATEGORIES = new Set<StoreCategory>([
  'sundae',
  'bungeoppang',
  'dakkochi',
  'mandu',
  'takoyaki',
  'chicken',
  'gopchang',
  'hotteok',
  'hoe',
  'other',
]);

export interface RegistrationInput {
  name?: string | null;
  category?: StoreCategory | null;
  menu?: string | null;
  today_hours?: string | null;
  location_text?: string | null;
  lat?: number | null;
  lng?: number | null;
  photo_menu?: string | null;
  photo_location?: string | null;
  photo_truck?: string | null;
}

/** 선택 입력 — 비어 있으면 빈 문자열, 길이만 검사 */
function trimOptional(
  value: unknown,
  label: string,
  maxLen: number
): string {
  if (value == null || value === '') return '';
  if (typeof value !== 'string') {
    throw new Error(`INVALID_${label}`);
  }
  const next = value.trim();
  if (next.length > maxLen) {
    throw new Error(`TOO_LONG_${label}`);
  }
  return next;
}

function optionalPhoto(value: unknown, field: string): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') {
    throw new Error(`INVALID_PHOTO_${field}`);
  }
  if (value.length > MAX_PHOTO_CHARS) {
    throw new Error(`PHOTO_TOO_LARGE_${field}`);
  }
  const compact = value.replace(/\s+/g, '');
  if (!DATA_IMAGE_RE.test(compact)) {
    throw new Error(`INVALID_PHOTO_${field}`);
  }
  return compact;
}

function optionalCoord(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (Number.isNaN(n) || n < -90 || n > 90) {
    // lat/lng 범위를 느슨히: 아래에서 lat/lng 각각 검사
    if (Number.isNaN(n)) return null;
  }
  return Number.isFinite(n) ? n : null;
}

export async function createStoreRegistration(
  env: Env,
  raw: RegistrationInput
) {
  const name = trimOptional(raw.name, 'NAME', MAX_NAME);
  const menu = trimOptional(raw.menu, 'MENU', MAX_MENU);
  const today_hours = trimOptional(
    raw.today_hours,
    'TODAY_HOURS',
    MAX_TODAY_HOURS
  );
  const location_text = trimOptional(raw.location_text, 'LOCATION', MAX_LOCATION);

  let category: StoreCategory = 'other';
  if (raw.category != null && raw.category !== '') {
    if (
      typeof raw.category !== 'string' ||
      !STORE_CATEGORIES.has(raw.category as StoreCategory)
    ) {
      throw new Error('INVALID_CATEGORY');
    }
    category = raw.category as StoreCategory;
  }

  let lat = optionalCoord(raw.lat);
  let lng = optionalCoord(raw.lng);
  if (lat != null && (lat < -90 || lat > 90)) {
    throw new Error('INVALID_LOCATION');
  }
  if (lng != null && (lng < -180 || lng > 180)) {
    throw new Error('INVALID_LOCATION');
  }
  // 한쪽만 오면 무효 처리
  if ((lat == null) !== (lng == null)) {
    lat = null;
    lng = null;
  }

  const photo_menu = optionalPhoto(raw.photo_menu, 'MENU');
  const photo_location = optionalPhoto(raw.photo_location, 'LOCATION');
  const photo_truck = optionalPhoto(raw.photo_truck, 'TRUCK');

  const hasAnything =
    Boolean(name) ||
    Boolean(menu) ||
    Boolean(today_hours) ||
    Boolean(location_text) ||
    raw.category != null ||
    Boolean(photo_menu || photo_location || photo_truck);
  if (!hasAnything) {
    throw new Error('EMPTY_PAYLOAD');
  }

  const id = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO store_registration_requests (
      id, name, category, menu, today_hours, location_text, lat, lng,
      photo_menu, photo_location, photo_truck, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`
  )
    .bind(
      id,
      name,
      category,
      menu,
      today_hours,
      location_text,
      lat,
      lng,
      photo_menu,
      photo_location,
      photo_truck
    )
    .run();

  const row = await env.DB.prepare(
    `SELECT id, name, category, menu, today_hours, location_text, lat, lng,
            CASE WHEN photo_menu IS NOT NULL THEN 1 ELSE 0 END AS has_photo_menu,
            CASE WHEN photo_location IS NOT NULL THEN 1 ELSE 0 END AS has_photo_location,
            CASE WHEN photo_truck IS NOT NULL THEN 1 ELSE 0 END AS has_photo_truck,
            status, created_at, notified_at
     FROM store_registration_requests WHERE id = ?`
  )
    .bind(id)
    .first<{
      id: string;
      name: string;
      category: StoreCategory;
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

  if (!row) {
    throw new Error('INSERT_FAILED');
  }

  const notify = await notifyStoreRegistration(env, {
    requestId: row.id,
    name: row.name,
    category: row.category,
    menu: row.menu,
    todayHours: row.today_hours,
    locationText: row.location_text,
    lat: row.lat,
    lng: row.lng,
    hasPhotoMenu: Boolean(row.has_photo_menu),
    hasPhotoLocation: Boolean(row.has_photo_location),
    hasPhotoTruck: Boolean(row.has_photo_truck),
    createdAt: row.created_at,
  });

  if (notify.notified) {
    await env.DB.prepare(
      `UPDATE store_registration_requests SET notified_at = datetime('now') WHERE id = ?`
    )
      .bind(row.id)
      .run();
    row.notified_at = new Date().toISOString();
  }

  return row;
}
