import type { Env } from '../types';
import { notifyStoreRegistration } from './notify';

const MAX_PHOTO_CHARS = 450_000;

export interface RegistrationInput {
  name: string;
  menu: string;
  today_hours: string;
  location_text: string;
  lat?: number | null;
  lng?: number | null;
  photo_menu?: string | null;
  photo_location?: string | null;
  photo_truck?: string | null;
}

function trimRequired(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new Error(`INVALID_${label}`);
  }
  const next = value.trim();
  if (!next) {
    throw new Error(`EMPTY_${label}`);
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
  if (!value.startsWith('data:image/')) {
    throw new Error(`INVALID_PHOTO_${field}`);
  }
  return value;
}

export async function createStoreRegistration(
  env: Env,
  raw: RegistrationInput
) {
  const name = trimRequired(raw.name, 'NAME');
  const menu = trimRequired(raw.menu, 'MENU');
  const today_hours = trimRequired(raw.today_hours, 'TODAY_HOURS');
  const location_text = trimRequired(raw.location_text, 'LOCATION');

  const lat =
    raw.lat != null && !Number.isNaN(Number(raw.lat)) ? Number(raw.lat) : null;
  const lng =
    raw.lng != null && !Number.isNaN(Number(raw.lng)) ? Number(raw.lng) : null;

  const photo_menu = optionalPhoto(raw.photo_menu, 'MENU');
  const photo_location = optionalPhoto(raw.photo_location, 'LOCATION');
  const photo_truck = optionalPhoto(raw.photo_truck, 'TRUCK');

  const id = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO store_registration_requests (
      id, name, menu, today_hours, location_text, lat, lng,
      photo_menu, photo_location, photo_truck, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`
  )
    .bind(
      id,
      name,
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
    `SELECT id, name, menu, today_hours, location_text, lat, lng,
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
