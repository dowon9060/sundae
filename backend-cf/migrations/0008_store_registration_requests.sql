-- 사용자 순대차(판매점) 등록 요청
CREATE TABLE store_registration_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  menu TEXT NOT NULL,
  today_hours TEXT NOT NULL,
  location_text TEXT NOT NULL,
  lat REAL,
  lng REAL,
  photo_menu TEXT,
  photo_location TEXT,
  photo_truck TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  notified_at TEXT
);

CREATE INDEX idx_store_reg_status ON store_registration_requests(status);
CREATE INDEX idx_store_reg_created ON store_registration_requests(created_at);
