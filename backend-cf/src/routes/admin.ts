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

admin.use('*', async (c, next) => {
  const key = c.req.header('X-Admin-Key') || '';
  if (!timingSafeEqual(key, c.env.ADMIN_KEY)) {
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
