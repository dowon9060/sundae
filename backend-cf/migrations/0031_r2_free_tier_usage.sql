-- R2 무료 한도(저장·월간 Class A/B) 추적용. 한도 안에서만 업로드·서빙한다.
CREATE TABLE IF NOT EXISTS r2_usage (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total_bytes INTEGER NOT NULL DEFAULT 0,
  month_key TEXT NOT NULL DEFAULT '',
  month_class_a INTEGER NOT NULL DEFAULT 0,
  month_class_b INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO r2_usage (id, total_bytes, month_key, month_class_a, month_class_b)
VALUES (1, 0, '', 0, 0);
