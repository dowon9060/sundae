import { Hono } from 'hono';
import type { BusinessStatus, Env, StoreCategory, StoreStatus } from '../types';
import { listRegistrationRequests } from '../services/adminRegistrations';
import {
  getAdminPublicByEmail,
  isValidEmail,
  updateAdminProfile,
} from '../services/admins';
import { getAnalyticsOverview } from '../services/analytics';
import {
  createStore,
  getAdminStoreDetail,
  getStoreById,
  listAdminStores,
  listRegionsWithCounts,
  MAX_STORE_PHOTOS,
  normalizePhotoUrls,
  updateStore,
  updateStoreHours,
  updateStoreLocation,
} from '../services/stores';
import { MAX_PHOTO_BYTES, savePhoto } from '../services/photos';

const admin = new Hono<{ Bindings: Env }>();

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

const WEAK_ADMIN_KEYS = new Set([
  '',
  'dev-admin-key',
  'admin',
  'password',
  'secret',
]);

const CATEGORIES = new Set([
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
const STATUSES = new Set(['active', 'inactive']);

function readPhotoUrls(value: unknown): { urls?: string[]; error?: string } {
  if (value === undefined) return {};
  try {
    return { urls: normalizePhotoUrls(value) };
  } catch (err) {
    return {
      error:
        err instanceof Error && err.message === 'TOO_MANY_PHOTOS'
          ? `사진은 최대 ${MAX_STORE_PHOTOS}장까지 등록할 수 있습니다.`
          : 'photo_urls가 올바르지 않습니다.',
    };
  }
}
const BUSINESS_STATUSES = new Set(['expected', 'confirmed_open', 'unknown']);

admin.use('*', async (c, next) => {
  const configured = (c.env.ADMIN_KEY || '').trim();
  const isProd = (c.env.ENVIRONMENT || 'local') === 'production';

  if (!configured || WEAK_ADMIN_KEYS.has(configured)) {
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'admin_key_not_configured',
        environment: c.env.ENVIRONMENT || 'local',
      })
    );
    return c.json(
      {
        error: isProd
          ? '관리자 API가 비활성화되어 있습니다.'
          : 'ADMIN_KEY가 설정되지 않았습니다. .dev.vars를 확인하세요.',
      },
      503
    );
  }

  if (isProd && configured.length < 24) {
    return c.json({ error: '관리자 API가 비활성화되어 있습니다.' }, 503);
  }

  const key = c.req.header('X-Admin-Key') || '';
  if (!timingSafeEqual(key, configured)) {
    return c.json({ error: '관리자 인증이 필요합니다.' }, 401);
  }
  await next();
});

admin.get('/me', async (c) => {
  const email = (c.req.header('X-Admin-Email') || '').trim();
  if (!email || !isValidEmail(email)) {
    return c.json({ error: '관리자 이메일이 필요합니다.' }, 400);
  }
  const data = await getAdminPublicByEmail(c.env, email);
  if (!data) {
    return c.json({ error: '관리자를 찾을 수 없습니다.' }, 404);
  }
  return c.json({ data });
});

admin.patch('/me', async (c) => {
  const email = (c.req.header('X-Admin-Email') || '').trim();
  if (!email || !isValidEmail(email)) {
    return c.json({ error: '관리자 이메일이 필요합니다.' }, 400);
  }

  const body = await c.req.json<{
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }>();

  const result = await updateAdminProfile(c.env, email, {
    name: body.name,
    email: body.email,
    currentPassword: body.currentPassword,
    newPassword: body.newPassword,
  });

  if ('error' in result) {
    return c.json({ error: result.error }, result.status as 400 | 401 | 404 | 409 | 500);
  }
  return c.json({ data: result.admin });
});


admin.get('/regions', async (c) => {
  const data = await listRegionsWithCounts(c.env);
  return c.json({ data });
});

admin.get('/analytics/overview', async (c) => {
  const raw = Number(c.req.query('days') || '30');
  const days = Number.isFinite(raw) ? raw : 30;
  try {
    const data = await getAnalyticsOverview(c.env, days);
    return c.json({ data });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown';
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'admin_analytics_overview_failed',
        detail,
      })
    );
    return c.json({ error: '활성 지표를 불러오지 못했습니다.' }, 500);
  }
});

admin.get('/registration-requests', async (c) => {
  const status = c.req.query('status') || undefined;
  const page = Number(c.req.query('page') || '1');
  const limit = Number(c.req.query('limit') || '50');
  const data = await listRegistrationRequests(c.env, {
    status,
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? limit : 50,
  });
  return c.json({ data });
});

admin.get('/stores', async (c) => {
  const region = c.req.query('region') || undefined;
  const categoryRaw = c.req.query('category') || undefined;
  const statusRaw = c.req.query('status') || undefined;
  const q = c.req.query('q') || undefined;
  const page = Number(c.req.query('page') || '1');
  const limit = Number(c.req.query('limit') || '50');

  if (categoryRaw && !CATEGORIES.has(categoryRaw)) {
    return c.json({ error: 'category가 올바르지 않습니다.' }, 400);
  }
  if (statusRaw && !STATUSES.has(statusRaw)) {
    return c.json({ error: 'status가 올바르지 않습니다.' }, 400);
  }

  const data = await listAdminStores(c.env, {
    region,
    category: categoryRaw as StoreCategory | undefined,
    status: statusRaw as StoreStatus | undefined,
    q,
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? limit : 50,
  });
  return c.json({ data });
});

admin.get('/stores/:id', async (c) => {
  const id = c.req.param('id');
  const data = await getAdminStoreDetail(c.env, id);
  if (!data) {
    return c.json({ error: '판매점을 찾을 수 없습니다.' }, 404);
  }
  return c.json({ data });
});

admin.post('/stores', async (c) => {
  const body = await c.req.json<{
    name?: string;
    category?: string;
    lat?: number;
    lng?: number;
    address?: string;
    description?: string | null;
    photo_url?: string | null;
    photo_urls?: unknown;
    location_note?: string | null;
    business_status?: string;
    status?: string;
    menus?: Array<{ name: string; price: number; photo_url?: string | null }>;
    hours?: Array<{
      day_of_week: number;
      open_time?: string | null;
      close_time?: string | null;
      is_closed: boolean;
    }>;
  }>();

  if (!body.name?.trim()) {
    return c.json({ error: 'name이 필요합니다.' }, 400);
  }
  if (!body.category || !CATEGORIES.has(body.category)) {
    return c.json({ error: 'category가 올바르지 않습니다.' }, 400);
  }
  if (typeof body.lat !== 'number' || typeof body.lng !== 'number') {
    return c.json({ error: 'lat, lng가 필요합니다.' }, 400);
  }
  if (body.lat < -90 || body.lat > 90 || body.lng < -180 || body.lng > 180) {
    return c.json({ error: '좌표 범위가 올바르지 않습니다.' }, 400);
  }
  if (!body.address?.trim()) {
    return c.json({ error: 'address가 필요합니다.' }, 400);
  }
  if (body.business_status && !BUSINESS_STATUSES.has(body.business_status)) {
    return c.json({ error: 'business_status가 올바르지 않습니다.' }, 400);
  }
  if (body.status && !STATUSES.has(body.status)) {
    return c.json({ error: 'status가 올바르지 않습니다.' }, 400);
  }
  const photos = readPhotoUrls(body.photo_urls);
  if (photos.error) return c.json({ error: photos.error }, 400);

  const data = await createStore(c.env, {
    name: body.name,
    category: body.category as StoreCategory,
    lat: body.lat,
    lng: body.lng,
    address: body.address,
    description: body.description,
    photo_url: body.photo_url,
    photo_urls: photos.urls,
    location_note: body.location_note,
    business_status: body.business_status as BusinessStatus | undefined,
    status: body.status as StoreStatus | undefined,
    menus: body.menus,
    hours: body.hours,
  });
  return c.json({ data }, 201);
});

admin.patch('/stores/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{
    name?: string;
    category?: string;
    description?: string | null;
    photo_url?: string | null;
    photo_urls?: unknown;
    status?: string;
    business_status?: string;
    lat?: number;
    lng?: number;
    address?: string;
    location_note?: string | null;
    menus?: Array<{ name: string; price: number; photo_url?: string | null }>;
  }>();

  if (body.category && !CATEGORIES.has(body.category)) {
    return c.json({ error: 'category가 올바르지 않습니다.' }, 400);
  }
  if (body.status && !STATUSES.has(body.status)) {
    return c.json({ error: 'status가 올바르지 않습니다.' }, 400);
  }
  if (body.business_status && !BUSINESS_STATUSES.has(body.business_status)) {
    return c.json({ error: 'business_status가 올바르지 않습니다.' }, 400);
  }
  if (body.lat != null && (typeof body.lat !== 'number' || body.lat < -90 || body.lat > 90)) {
    return c.json({ error: 'lat이 올바르지 않습니다.' }, 400);
  }
  if (body.lng != null && (typeof body.lng !== 'number' || body.lng < -180 || body.lng > 180)) {
    return c.json({ error: 'lng가 올바르지 않습니다.' }, 400);
  }
  const photos = readPhotoUrls(body.photo_urls);
  if (photos.error) return c.json({ error: photos.error }, 400);

  try {
    const data = await updateStore(c.env, id, {
      name: body.name,
      category: body.category as StoreCategory | undefined,
      description: body.description,
      photo_url: body.photo_url,
      photo_urls: photos.urls,
      status: body.status as StoreStatus | undefined,
      business_status: body.business_status as BusinessStatus | undefined,
      lat: body.lat,
      lng: body.lng,
      address: body.address,
      location_note: body.location_note,
      menus: body.menus,
    });
    if (!data) {
      return c.json({ error: '판매점을 찾을 수 없습니다.' }, 404);
    }
    return c.json({ data });
  } catch (err) {
    if (err instanceof Error && err.message === 'LOCATION_INCOMPLETE') {
      return c.json({ error: '위치 정보가 불완전합니다. lat, lng, address를 확인하세요.' }, 400);
    }
    throw err;
  }
});

admin.patch('/stores/:id/location', async (c) => {
  const id = c.req.param('id');
  const store = await getStoreById(c.env, id);
  if (!store) {
    return c.json({ error: '판매점을 찾을 수 없습니다.' }, 404);
  }

  const body = await c.req.json<{
    lat: number;
    lng: number;
    address: string;
    location_note?: string | null;
  }>();

  if (
    typeof body.lat !== 'number' ||
    typeof body.lng !== 'number' ||
    !body.address
  ) {
    return c.json({ error: 'lat, lng, address가 필요합니다.' }, 400);
  }

  const data = await updateStoreLocation(c.env, id, body);
  return c.json({ data });
});

admin.patch('/stores/:id/hours', async (c) => {
  const id = c.req.param('id');
  const store = await getStoreById(c.env, id);
  if (!store) {
    return c.json({ error: '판매점을 찾을 수 없습니다.' }, 404);
  }

  const body = await c.req.json<{
    hours: Array<{
      day_of_week: number;
      open_time?: string | null;
      close_time?: string | null;
      is_closed: boolean;
    }>;
  }>();

  if (!Array.isArray(body.hours) || body.hours.length === 0) {
    return c.json({ error: 'hours 배열이 필요합니다.' }, 400);
  }

  const data = await updateStoreHours(c.env, id, body.hours);
  return c.json({ data });
});

const PHOTO_ERROR_MESSAGES: Record<string, string> = {
  EMPTY_PHOTO: '사진 파일이 비어 있습니다.',
  PHOTO_TOO_LARGE: '사진은 5MB 이하만 올릴 수 있습니다.',
  INVALID_PHOTO_TYPE: 'JPG, PNG, WEBP 사진만 올릴 수 있습니다.',
};

/** 본문: 이미지 바이너리 그대로 (Content-Type: image/*) */
admin.post('/photos', async (c) => {
  const declared = Number(c.req.header('Content-Length') || '0');
  if (declared > MAX_PHOTO_BYTES) {
    return c.json({ error: PHOTO_ERROR_MESSAGES.PHOTO_TOO_LARGE }, 413);
  }
  const email = (c.req.header('X-Admin-Email') || '').trim() || 'unknown';
  try {
    const body = await c.req.arrayBuffer();
    const data = await savePhoto(c.env, body, new URL(c.req.url).origin, email);
    return c.json({ data }, 201);
  } catch (err) {
    const code = err instanceof Error ? err.message : '';
    const message = PHOTO_ERROR_MESSAGES[code];
    if (message) {
      return c.json({ error: message }, code === 'PHOTO_TOO_LARGE' ? 413 : 400);
    }
    console.error(
      JSON.stringify({ level: 'error', message: 'photo_upload_failed', error: String(err) })
    );
    return c.json({ error: '사진 업로드에 실패했습니다.' }, 500);
  }
});

export default admin;
