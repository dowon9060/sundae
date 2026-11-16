import type { Env } from '../types';
import { hashPassword, verifyPassword } from './password';

export type AdminRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

export type AdminPublic = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

function toPublic(row: AdminRow): AdminPublic {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function findAdminByEmail(
  env: Env,
  email: string
): Promise<AdminRow | null> {
  return (
    (await env.DB.prepare(
      `SELECT * FROM admins WHERE email = ? COLLATE NOCASE LIMIT 1`
    )
      .bind(email.trim())
      .first<AdminRow>()) ?? null
  );
}

export async function loginAdmin(
  env: Env,
  email: string,
  password: string
): Promise<AdminPublic | null> {
  const row = await findAdminByEmail(env, email);
  if (!row) return null;
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return null;
  return toPublic(row);
}

export async function getAdminPublicByEmail(
  env: Env,
  email: string
): Promise<AdminPublic | null> {
  const row = await findAdminByEmail(env, email);
  return row ? toPublic(row) : null;
}

export async function updateAdminProfile(
  env: Env,
  email: string,
  input: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }
): Promise<{ admin: AdminPublic } | { error: string; status: number }> {
  const row = await findAdminByEmail(env, email);
  if (!row) {
    return { error: '관리자를 찾을 수 없습니다.', status: 404 };
  }

  let nextName = row.name;
  let nextEmail = row.email;
  let nextHash = row.password_hash;

  if (input.name != null) {
    const name = input.name.trim();
    if (!name || name.length > 40) {
      return { error: '이름은 1~40자로 입력해 주세요.', status: 400 };
    }
    nextName = name;
  }

  if (input.email != null && input.email.trim().toLowerCase() !== row.email.toLowerCase()) {
    const newEmail = input.email.trim().toLowerCase();
    if (!isValidEmail(newEmail)) {
      return { error: '이메일 형식이 올바르지 않습니다.', status: 400 };
    }
    const exists = await findAdminByEmail(env, newEmail);
    if (exists && exists.id !== row.id) {
      return { error: '이미 사용 중인 이메일입니다.', status: 409 };
    }
    nextEmail = newEmail;
  }

  if (input.newPassword != null && input.newPassword !== '') {
    if (!input.currentPassword) {
      return { error: '비밀번호 변경 시 현재 비밀번호가 필요합니다.', status: 400 };
    }
    const ok = await verifyPassword(input.currentPassword, row.password_hash);
    if (!ok) {
      return { error: '현재 비밀번호가 올바르지 않습니다.', status: 401 };
    }
    if (input.newPassword.length < 8) {
      return { error: '새 비밀번호는 8자 이상이어야 합니다.', status: 400 };
    }
    nextHash = await hashPassword(input.newPassword);
  }

  await env.DB.prepare(
    `UPDATE admins
     SET name = ?, email = ?, password_hash = ?, updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(nextName, nextEmail, nextHash, row.id)
    .run();

  const updated = await env.DB.prepare(`SELECT * FROM admins WHERE id = ?`)
    .bind(row.id)
    .first<AdminRow>();

  if (!updated) {
    return { error: '저장에 실패했습니다.', status: 500 };
  }

  return { admin: toPublic(updated) };
}
