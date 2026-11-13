import { Hono } from 'hono';
import type { Env, StoreCategory } from '../types';
import { createStoreReport, isValidReportReason } from '../services/reports';
import { REPORT_REASON_LABELS } from '../services/notify';
import { getHours, getMenus, getStoreById, listNearbyStores } from '../services/stores';

const stores = new Hono<{ Bindings: Env }>();

stores.get('/nearby', async (c) => {
  const lat = Number(c.req.query('lat'));
  const lng = Number(c.req.query('lng'));
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return c.json({ error: 'lat, lng 쿼리가 필요합니다.' }, 400);
  }

  const category = (c.req.query('category') || 'all') as StoreCategory | 'all';
  const radius = Number(c.req.query('radius') || '5000');
  const excludeStale = c.req.query('exclude_stale') === '1';

  const data = await listNearbyStores(c.env, {
    lat,
    lng,
    category,
    radiusM: Number.isNaN(radius) ? 5000 : radius,
    excludeStale,
  });

  return c.json({ data });
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
