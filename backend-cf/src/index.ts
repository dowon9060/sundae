import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { clearRateLimitBuckets, rateLimit } from './middleware/rateLimit';
import stores from './routes/stores';
import locations from './routes/locations';
import admin from './routes/admin';

const app = new Hono<{ Bindings: Env }>();

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Admin-Key'],
    exposeHeaders: ['Retry-After', 'X-RateLimit-Limit'],
  })
);

app.get('/health', (c) => c.json({ ok: true, service: 'sundaecha-api' }));

/** 로컬 개발: 레이트 리밋 버킷 비우기 */
app.post('/dev/clear-rate-limit', (c) => {
  clearRateLimitBuckets();
  return c.json({ ok: true });
});

/** 일반 API: IP당 분당 60회 */
app.use('/api/*', rateLimit({ name: 'api', windowMs: 60_000, max: 60 }));

/** 등록·제보: IP당 분당 8회 (추가 제한) */
app.use(
  '/api/stores/registration-requests',
  rateLimit({ name: 'register', windowMs: 60_000, max: 8 })
);
app.use(
  '/api/stores/:id/reports',
  rateLimit({ name: 'report', windowMs: 60_000, max: 8 })
);

app.route('/api/stores', stores);
app.route('/api/locations', locations);
app.route('/api/admin', admin);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error(JSON.stringify({ level: 'error', message: err.message }));
  return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
});

export default app;
