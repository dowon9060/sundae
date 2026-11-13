import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
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
  })
);

app.get('/health', (c) => c.json({ ok: true, service: 'sundaecha-api' }));

app.route('/api/stores', stores);
app.route('/api/locations', locations);
app.route('/api/admin', admin);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error(JSON.stringify({ level: 'error', message: err.message }));
  return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
});

export default app;
