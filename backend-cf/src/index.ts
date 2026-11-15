import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { clearRateLimitBuckets, rateLimit } from './middleware/rateLimit';
import stores from './routes/stores';
import locations from './routes/locations';
import admin from './routes/admin';

const app = new Hono<{ Bindings: Env }>();

function isLocalDev(env: Env): boolean {
  return (env.ENVIRONMENT || 'local') === 'local';
}

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

/**
 * 로컬 개발 전용 — ENVIRONMENT=local 일 때만 동작.
 * 프로덕션에서는 404로 숨겨 레이트 리밋 우회를 막는다.
 */
app.post('/dev/clear-rate-limit', async (c) => {
  if (!isLocalDev(c.env)) {
    return c.json({ error: 'Not found' }, 404);
  }
  clearRateLimitBuckets();
  try {
    await c.env.DB.prepare(`DELETE FROM rate_limit_hits`).run();
  } catch {
    // 테이블 없으면 무시
  }
  return c.json({ ok: true });
});

/** 일반 API: IP당 분당 60회 (메모리) */
app.use('/api/*', rateLimit({ name: 'api', windowMs: 60_000, max: 60 }));

/** 등록·제보·좋아요: D1 durable 추가 제한 */
app.use(
  '/api/stores/registration-requests',
  rateLimit({ name: 'register', windowMs: 60_000, max: 5, durable: true })
);
app.use(
  '/api/stores/:id/reports',
  rateLimit({ name: 'report', windowMs: 60_000, max: 5, durable: true })
);
app.use(
  '/api/stores/:id/likes',
  rateLimit({ name: 'like', windowMs: 60_000, max: 30, durable: true })
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
