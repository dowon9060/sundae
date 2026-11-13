-- 판매점 기본 정보
CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sundae', 'chicken', 'other')),
  description TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  business_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (business_status IN ('expected', 'confirmed_open', 'unknown')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 현재 판매 위치 (이동식 특성상 기본정보와 분리)
CREATE TABLE store_locations (
  store_id TEXT PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  address TEXT NOT NULL,
  location_note TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 요일별 정기 운영시간 (0=일 … 6=토)
CREATE TABLE business_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TEXT,
  close_time TEXT,
  is_closed INTEGER NOT NULL DEFAULT 0,
  UNIQUE (store_id, day_of_week)
);

-- 메뉴
CREATE TABLE menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  photo_url TEXT,
  is_available INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 임시 휴무 / 변경 운영시간
CREATE TABLE schedule_exceptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  is_closed INTEGER NOT NULL DEFAULT 0,
  open_time TEXT,
  close_time TEXT,
  note TEXT,
  UNIQUE (store_id, date)
);

CREATE INDEX idx_stores_category ON stores(category);
CREATE INDEX idx_store_locations_coords ON store_locations(lat, lng);
CREATE INDEX idx_menus_store ON menus(store_id);
CREATE INDEX idx_hours_store ON business_hours(store_id);
CREATE INDEX idx_exceptions_store_date ON schedule_exceptions(store_id, date);
