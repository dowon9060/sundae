import { Hono } from 'hono';
import type { Env } from '../types';
import { getStoreById, updateStoreHours, updateStoreLocation } from '../services/stores';

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

export default admin;
