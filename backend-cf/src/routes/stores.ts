import { Hono } from 'hono';
import type { Env, StoreCategory } from '../types';
import { createStoreRegistration } from '../services/registrations';
import { createStoreReport, isValidReportReason } from '../services/reports';
import { REPORT_REASON_LABELS } from '../services/notify';
import { isValidClientId, toggleStoreLike } from '../services/likes';
import { getHours, getMenus, getStoreById, listNearbyStores } from '../services/stores';
import { verifyStore } from '../services/verifications';

const stores = new Hono<{ Bindings: Env }>();

const REG_ERROR_MESSAGES: Record<string, string> = {
  EMPTY_PAYLOAD: '내용을 하나 이상 입력해 주세요.',
  INVALID_CATEGORY: '카테고리가 올바르지 않습니다.',
  INVALID_NAME: '이름 형식이 올바르지 않습니다.',
  INVALID_MENU: '메뉴 형식이 올바르지 않습니다.',
  INVALID_TODAY_HOURS: '운영 시간 형식이 올바르지 않습니다.',
  INVALID_LOCATION: '위치 형식이 올바르지 않습니다.',
  TOO_LONG_NAME: '이름이 너무 깁니다. 80자 이내로 입력해 주세요.',
  TOO_LONG_MENU: '메뉴가 너무 깁니다. 500자 이내로 입력해 주세요.',
  TOO_LONG_TODAY_HOURS: '운영 시간이 너무 깁니다.',
  TOO_LONG_LOCATION: '위치가 너무 깁니다. 200자 이내로 입력해 주세요.',
  INVALID_PHOTO_MENU: '메뉴 사진 형식이 올바르지 않습니다.',
  INVALID_PHOTO_LOCATION: '위치 사진 형식이 올바르지 않습니다.',
  INVALID_PHOTO_TRUCK: '푸드트럭 사진 형식이 올바르지 않습니다.',
  PHOTO_TOO_LARGE_MENU: '메뉴 사진이 너무 큽니다. 다시 첨부해 주세요.',
  PHOTO_TOO_LARGE_LOCATION: '위치 사진이 너무 큽니다. 다시 첨부해 주세요.',
  PHOTO_TOO_LARGE_TRUCK: '푸드트럭 사진이 너무 큽니다. 다시 첨부해 주세요.',
};

stores.get('/nearby', async (c) => {
  const lat = Number(c.req.query('lat'));
  const lng = Number(c.req.query('lng'));
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return c.json({ error: 'lat, lng 쿼리가 필요합니다.' }, 400);
  }

  const category = (c.req.query('category') || 'all') as StoreCategory | 'all';
  const radius = Number(c.req.query('radius') || '5000');
  const dayRaw = c.req.query('day');
  const dayParsed = dayRaw != null ? Number(dayRaw) : undefined;
  const dayOfWeek =
    dayParsed != null && !Number.isNaN(dayParsed) && dayParsed >= 0 && dayParsed <= 6
      ? dayParsed
      : undefined;
  const excludeStale = c.req.query('exclude_stale') === '1';
  const clientRaw = c.req.query('client_id');
  const clientId = isValidClientId(clientRaw) ? clientRaw : undefined;

  const data = await listNearbyStores(c.env, {
    lat,
    lng,
    category,
    radiusM: Number.isNaN(radius) ? 5000 : radius,
    dayOfWeek,
    excludeStale,
    clientId,
  });

  return c.json({ data });
});

stores.post('/:id/likes', async (c) => {
  const id = c.req.param('id');
  let body: { client_id?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '요청 본문을 확인할 수 없습니다.' }, 400);
  }

  if (!isValidClientId(body.client_id)) {
    return c.json({ error: '클라이언트 식별자가 올바르지 않습니다.' }, 400);
  }

  try {
    const data = await toggleStoreLike(c.env, id, body.client_id);
    return c.json({ data });
  } catch (err) {
    if (err instanceof Error && err.message === 'STORE_NOT_FOUND') {
      return c.json({ error: '판매점을 찾을 수 없습니다.' }, 404);
    }
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'store_like_toggle_failed',
        detail: err instanceof Error ? err.message : 'unknown',
      })
    );
    return c.json(
      { error: '좋아요를 반영하지 못했습니다. 잠시 후 다시 시도해 주세요.' },
      500
    );
  }
});

stores.post('/:id/verifications', async (c) => {
  const id = c.req.param('id');
  let body: { client_id?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '요청 본문을 확인할 수 없습니다.' }, 400);
  }

  if (!isValidClientId(body.client_id)) {
    return c.json({ error: '클라이언트 식별자가 올바르지 않습니다.' }, 400);
  }

  try {
    const data = await verifyStore(c.env, id, body.client_id);
    return c.json({ data });
  } catch (err) {
    if (err instanceof Error && err.message === 'STORE_NOT_FOUND') {
      return c.json({ error: '판매점을 찾을 수 없습니다.' }, 404);
    }
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'store_verify_failed',
        detail: err instanceof Error ? err.message : 'unknown',
      })
    );
    return c.json(
      { error: '인증을 반영하지 못했습니다. 잠시 후 다시 시도해 주세요.' },
      500
    );
  }
});

stores.post('/registration-requests', async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '요청 본문을 확인할 수 없습니다.' }, 400);
  }

  try {
    const data = await createStoreRegistration(c.env, {
      name: body.name as string,
      category: body.category as StoreCategory,
      menu: body.menu as string,
      today_hours: body.today_hours as string,
      location_text: body.location_text as string,
      lat: body.lat as number | null | undefined,
      lng: body.lng as number | null | undefined,
      photo_menu: body.photo_menu as string | null | undefined,
      photo_location: body.photo_location as string | null | undefined,
      photo_truck: body.photo_truck as string | null | undefined,
    });

    return c.json(
      {
        data: {
          id: data.id,
          name: data.name,
          category: data.category,
          status: data.status,
          created_at: data.created_at,
          has_photo_menu: Boolean(data.has_photo_menu),
          has_photo_location: Boolean(data.has_photo_location),
          has_photo_truck: Boolean(data.has_photo_truck),
        },
        message: '등록 요청이 접수되었습니다. 확인 후 반영할게요.',
      },
      201
    );
  } catch (err) {
    const code = err instanceof Error ? err.message : '';
    const message = REG_ERROR_MESSAGES[code];
    if (message) {
      return c.json({ error: message }, 400);
    }
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'store_registration_failed',
        detail: code || 'unknown',
      })
    );
    return c.json(
      { error: '등록 요청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.' },
      500
    );
  }
});

stores.get('/:id', async (c) => {
  const id = c.req.param('id');
  const latQ = c.req.query('lat');
  const lngQ = c.req.query('lng');
  const lat = latQ != null ? Number(latQ) : undefined;
  const lng = lngQ != null ? Number(lngQ) : undefined;

  const store = await getStoreById(
    c.env,
    id,
    lat != null && !Number.isNaN(lat) ? lat : undefined,
    lng != null && !Number.isNaN(lng) ? lng : undefined
  );

  if (!store) {
    return c.json({ error: '판매점을 찾을 수 없습니다.' }, 404);
  }

  return c.json({ data: store });
});

stores.get('/:id/menus', async (c) => {
  const id = c.req.param('id');
  const store = await getStoreById(c.env, id);
  if (!store) {
    return c.json({ error: '판매점을 찾을 수 없습니다.' }, 404);
  }

  const menus = await getMenus(c.env, id);
  return c.json({
    data: menus.map((m) => ({
      ...m,
      is_available: Boolean(m.is_available),
    })),
  });
});

stores.get('/:id/hours', async (c) => {
  const id = c.req.param('id');
  const store = await getStoreById(c.env, id);
  if (!store) {
    return c.json({ error: '판매점을 찾을 수 없습니다.' }, 404);
  }

  const data = await getHours(c.env, id);
  return c.json({ data });
});

stores.post('/:id/reports', async (c) => {
  const id = c.req.param('id');
  let body: { reason?: string; memo?: string | null };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '요청 본문을 확인할 수 없습니다.' }, 400);
  }

  if (!body.reason || !isValidReportReason(body.reason)) {
    return c.json(
      {
        error: '제보 사유를 선택해 주세요.',
        allowed_reasons: Object.entries(REPORT_REASON_LABELS).map(
          ([value, label]) => ({ value, label })
        ),
      },
      400
    );
  }

  try {
    const data = await createStoreReport(c.env, id, {
      reason: body.reason,
      memo: body.memo,
    });
    return c.json(
      {
        data: {
          ...data,
          reason_label: REPORT_REASON_LABELS[data.reason],
        },
        message: '제보가 접수되었습니다. 확인 후 반영할게요.',
      },
      201
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'STORE_NOT_FOUND') {
      return c.json({ error: '판매점을 찾을 수 없습니다.' }, 404);
    }
    throw err;
  }
});

export default stores;
