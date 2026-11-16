-- 판매점 현장 인증 수 + 기기(client)별 인증 기록 (1기기 1회)
ALTER TABLE stores ADD COLUMN verify_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS store_verifications (
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (store_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_store_verifications_client
  ON store_verifications(client_id);
