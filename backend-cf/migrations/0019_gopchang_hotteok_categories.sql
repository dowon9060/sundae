-- 카테고리 추가: 곱창(gopchang), 호떡(hotteok)
-- SQLite CHECK 확장을 위해 stores / store_registration_requests 재생성

PRAGMA foreign_keys = OFF;

-- stores
CREATE TABLE stores_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'sundae',
    'bungeoppang',
    'dakkochi',
    'mandu',
    'takoyaki',
    'chicken',
    'gopchang',
    'hotteok',
    'other'
  )),
  description TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  business_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (business_status IN ('expected', 'confirmed_open', 'unknown')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  like_count INTEGER NOT NULL DEFAULT 0
);

INSERT INTO stores_new (
  id, name, category, description, photo_url, status, business_status, created_at, like_count
)
SELECT
  id,
  name,
  CASE
    WHEN category IN (
      'sundae','bungeoppang','dakkochi','mandu','takoyaki','chicken','gopchang','hotteok','other'
    ) THEN category
    ELSE 'other'
  END,
  description,
  photo_url,
  status,
  business_status,
  created_at,
  COALESCE(like_count, 0)
FROM stores;

DROP TABLE stores;
ALTER TABLE stores_new RENAME TO stores;
CREATE INDEX IF NOT EXISTS idx_stores_category ON stores(category);

-- 기타 → 곱창 / 호떡 재분류
UPDATE stores
SET category = 'gopchang'
WHERE category = 'other'
  AND (
    name LIKE '%곱창%'
    OR COALESCE(description, '') LIKE '%곱창%'
  );

UPDATE stores
SET category = 'hotteok'
WHERE category = 'other'
  AND (
    name LIKE '%호떡%'
    OR COALESCE(description, '') LIKE '%호떡%'
  );

-- store_registration_requests
CREATE TABLE store_registration_requests_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'sundae' CHECK (category IN (
    'sundae',
    'bungeoppang',
    'dakkochi',
    'mandu',
    'takoyaki',
    'chicken',
    'gopchang',
    'hotteok',
    'other'
  )),
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

INSERT INTO store_registration_requests_new (
  id, name, category, menu, today_hours, location_text, lat, lng,
  photo_menu, photo_location, photo_truck, status, created_at, notified_at
)
SELECT
  id,
  name,
  CASE
    WHEN category IN (
      'sundae','bungeoppang','dakkochi','mandu','takoyaki','chicken','gopchang','hotteok','other'
    ) THEN category
    ELSE 'sundae'
  END,
  menu,
  today_hours,
  location_text,
  lat,
  lng,
  photo_menu,
  photo_location,
  photo_truck,
  status,
  created_at,
  notified_at
FROM store_registration_requests;

DROP TABLE store_registration_requests;
ALTER TABLE store_registration_requests_new RENAME TO store_registration_requests;
CREATE INDEX IF NOT EXISTS idx_store_reg_status ON store_registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_store_reg_created ON store_registration_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_store_reg_category ON store_registration_requests(category);

PRAGMA foreign_keys = ON;
