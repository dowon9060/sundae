-- 현장 인증: 기기당 하루 1회(서울 날짜), 판매점 근처에서만 인증
CREATE TABLE IF NOT EXISTS store_daily_verifications (
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  day TEXT NOT NULL,
  distance_m INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (store_id, client_id, day)
);

CREATE INDEX IF NOT EXISTS idx_daily_verifications_day_store
  ON store_daily_verifications(day, store_id);

-- 기존 1기기 1회 인증 기록은 인증한 날짜로 옮긴다 (stores.verify_count 누적값은 유지)
INSERT OR IGNORE INTO store_daily_verifications (store_id, client_id, day, created_at)
SELECT store_id, client_id, date(created_at, '+9 hours'), created_at
FROM store_verifications;
