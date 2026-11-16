-- 어드민 계정 (이메일 로그인)
CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_admins_email ON admins(email);

-- jiras90@gmail.com / tnseock1! (pbkdf2$100000$salt$hash)
INSERT INTO admins (id, email, name, password_hash, created_at, updated_at) VALUES (
  'admin-jiras90',
  'jiras90@gmail.com',
  '관리자',
  'pbkdf2$100000$vP/mopqjD0vT9589dCFG6Q==$zeQU8M+eQdcgAP6za9nYh3ooJw5ADw4mUQFhgooeVZk=',
  datetime('now'),
  datetime('now')
);
