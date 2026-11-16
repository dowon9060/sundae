-- 앱 일별 활성 (기기 client_id, KST day)
CREATE TABLE IF NOT EXISTS app_daily_actives (
  day TEXT NOT NULL,
  client_id TEXT NOT NULL,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (day, client_id)
);

CREATE INDEX IF NOT EXISTS idx_app_daily_actives_day
  ON app_daily_actives(day);
