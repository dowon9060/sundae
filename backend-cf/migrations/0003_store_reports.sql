-- 판매점 정보 제보 (운영일·위치·가격 등)
CREATE TABLE store_reports (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (
    reason IN ('hours_changed', 'no_longer_comes', 'location_changed', 'price_changed')
  ),
  memo TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  notified_at TEXT
);

CREATE INDEX idx_store_reports_store ON store_reports(store_id);
CREATE INDEX idx_store_reports_created ON store_reports(created_at);
