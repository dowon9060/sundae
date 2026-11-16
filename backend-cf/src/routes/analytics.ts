import { Hono } from 'hono';
import type { Env } from '../types';
import { recordAppOpen } from '../services/analytics';
import { isValidClientId } from '../services/likes';

const analytics = new Hono<{ Bindings: Env }>();

analytics.post('/app-open', async (c) => {
  let body: { client_id?: string };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '요청 본문을 확인할 수 없습니다.' }, 400);
  }

  if (!isValidClientId(body.client_id)) {
    return c.json({ error: '유효한 client_id가 필요합니다.' }, 400);
  }

  try {
    const data = await recordAppOpen(c.env, body.client_id);
    return c.json({ data: { ok: true, day: data.day } }, 200);
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown';
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'app_open_record_failed',
        detail,
      })
    );
    return c.json({ error: '활성 기록을 저장하지 못했습니다.' }, 500);
  }
});

export default analytics;
