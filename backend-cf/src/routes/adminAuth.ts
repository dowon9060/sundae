import { Hono } from 'hono';
import type { Env } from '../types';
import { isValidEmail, loginAdmin } from '../services/admins';

const adminAuth = new Hono<{ Bindings: Env }>();

adminAuth.post('/login', async (c) => {
  let body: { email?: string; password?: string } = {};
  try {
    body = await c.req.json<{ email?: string; password?: string }>();
  } catch {
    body = {};
  }
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return c.json({ error: '이메일과 비밀번호를 입력해 주세요.' }, 400);
  }
  if (!isValidEmail(email)) {
    return c.json({ error: '이메일 형식이 올바르지 않습니다.' }, 400);
  }

  try {
    const admin = await loginAdmin(c.env, email, password);
    if (!admin) {
      return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);
    }
    return c.json({ data: admin });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error(JSON.stringify({ level: 'error', message: 'admin_login_failed', detail: message }));
    return c.json({ error: '로그인 처리 중 오류가 발생했습니다. DB 마이그레이션을 확인하세요.' }, 503);
  }
});

export default adminAuth;
