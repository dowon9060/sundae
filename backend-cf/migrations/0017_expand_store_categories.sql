-- 카테고리 확장: 순대차·붕어빵·닭꼬치·만두·타코야키·치킨·기타
-- SQLite CHECK 확장을 위해 stores 테이블 재생성.

PRAGMA foreign_keys = OFF;

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
      'sundae',
      'bungeoppang',
      'dakkochi',
      'mandu',
      'takoyaki',
      'chicken',
      'other'
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

PRAGMA foreign_keys = ON;

-- 이름·설명 기반 재분류 (기타·치킨에서 분리)
UPDATE stores
SET category = 'takoyaki'
WHERE category IN ('other', 'chicken')
  AND (
    name LIKE '%타코야%'
    OR name LIKE '%타꼬야%'
    OR name LIKE '%타코야키%'
    OR name LIKE '%타꼬야끼%'
    OR COALESCE(description, '') LIKE '%타코야%'
  );

UPDATE stores
SET category = 'dakkochi'
WHERE category IN ('other', 'chicken')
  AND (
    name LIKE '%닭꼬치%'
    OR name LIKE '%꼬치%'
    OR COALESCE(description, '') LIKE '%닭꼬치%'
  )
  AND name NOT LIKE '%타코%'
  AND name NOT LIKE '%타꼬%';

UPDATE stores
SET category = 'mandu'
WHERE category IN ('other', 'chicken')
  AND (
    name LIKE '%만두%'
    OR COALESCE(description, '') LIKE '%만두%'
  )
  AND name NOT LIKE '%타코%'
  AND name NOT LIKE '%붕어%'
  AND name NOT LIKE '%잉어%';
