-- 맛나 가마솥순대 — 삼전역 인근 백제고분로19길 (스피드메이트 맞은편 핀)

INSERT OR IGNORE INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  (
    'store-manna-gamasot-samjeon',
    '맛나 가마솥순대',
    'sundae',
    '삼전역 인근 백제고분로19길. 스피드메이트 삼전 맞은편 골목 코너. 네이버 지도 핀 제보',
    NULL,
    'active',
    'expected'
  );

UPDATE stores
SET
  name = '맛나 가마솥순대',
  description = '삼전역 인근 백제고분로19길. 스피드메이트 삼전 맞은편 골목 코너. 네이버 지도 핀 제보',
  status = 'active',
  business_status = 'expected'
WHERE id = 'store-manna-gamasot-samjeon';

INSERT OR IGNORE INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  (
    'store-manna-gamasot-samjeon',
    37.5054,
    127.0873,
    '서울특별시 송파구 삼전동',
    '백제고분로19길·스피드메이트 맞은편 (삼전역 1·4번 출구 북측)',
    '2026-11-17T00:00:00.000Z'
  );

UPDATE store_locations
SET
  lat = 37.5054,
  lng = 127.0873,
  address = '서울특별시 송파구 삼전동',
  location_note = '백제고분로19길·스피드메이트 맞은편 (삼전역 1·4번 출구 북측)',
  updated_at = '2026-11-17T00:00:00.000Z'
WHERE store_id = 'store-manna-gamasot-samjeon';

DELETE FROM menus WHERE store_id = 'store-manna-gamasot-samjeon';

INSERT INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-manna-gamasot-samjeon', '찰순대', 5000, 1, 1),
  ('store-manna-gamasot-samjeon', '모듬순대', 7000, 1, 2),
  ('store-manna-gamasot-samjeon', '내장', 6000, 1, 3);

DELETE FROM business_hours WHERE store_id = 'store-manna-gamasot-samjeon';

INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('store-manna-gamasot-samjeon', 0, '17:00', '22:00', 0),
  ('store-manna-gamasot-samjeon', 1, '17:00', '22:00', 0),
  ('store-manna-gamasot-samjeon', 2, '17:00', '22:00', 0),
  ('store-manna-gamasot-samjeon', 3, '17:00', '22:00', 0),
  ('store-manna-gamasot-samjeon', 4, '17:00', '22:00', 0),
  ('store-manna-gamasot-samjeon', 5, '17:00', '22:00', 0),
  ('store-manna-gamasot-samjeon', 6, '17:00', '22:00', 0);
