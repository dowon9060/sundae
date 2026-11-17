-- 순대리아(헬리오시티) — 출처: blog.naver.com/ssussu59/224416054627
-- 매주 일요일 ~20:00 / 헬리오시티 앞 올리브영 옆 / 문의 1544-7350

INSERT OR IGNORE INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  (
    'store-sundaeria-heliocity',
    '순대리아(헬리오시티)',
    'sundae',
    '매주 일요일 20시까지. 헬리오시티 앞 올리브영 옆(송파대로 363). 블로그 ssussu59 224416054627. 문의 1544-7350',
    NULL,
    'active',
    'expected'
  );

UPDATE stores
SET
  name = '순대리아(헬리오시티)',
  description = '매주 일요일 20시까지. 헬리오시티 앞 올리브영 옆(송파대로 363). 블로그 ssussu59 224416054627. 문의 1544-7350',
  status = 'active',
  business_status = 'expected'
WHERE id = 'store-sundaeria-heliocity';

INSERT OR IGNORE INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  (
    'store-sundaeria-heliocity',
    37.4972,
    127.1065,
    '서울특별시 송파구 송파대로 363',
    '헬리오시티 앞 올리브영 옆(일 ~20:00)',
    '2026-11-17T00:00:00.000Z'
  );

UPDATE store_locations
SET
  lat = 37.4972,
  lng = 127.1065,
  address = '서울특별시 송파구 송파대로 363',
  location_note = '헬리오시티 앞 올리브영 옆(일 ~20:00)',
  updated_at = '2026-11-17T00:00:00.000Z'
WHERE store_id = 'store-sundaeria-heliocity';

DELETE FROM menus WHERE store_id = 'store-sundaeria-heliocity';

INSERT INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-sundaeria-heliocity', '찹쌀순대(소)', 6000, 1, 1),
  ('store-sundaeria-heliocity', '찹쌀순대(중)', 8000, 1, 2),
  ('store-sundaeria-heliocity', '토종순대(소)', 8000, 1, 3),
  ('store-sundaeria-heliocity', '토종순대(중)', 10000, 1, 4),
  ('store-sundaeria-heliocity', '김치순대(소)', 8000, 1, 5),
  ('store-sundaeria-heliocity', '김치순대(중)', 10000, 1, 6),
  ('store-sundaeria-heliocity', '내장만(소)', 8000, 1, 7),
  ('store-sundaeria-heliocity', '내장만(중)', 10000, 1, 8),
  ('store-sundaeria-heliocity', '찹쌀+토종(소)', 8000, 1, 9),
  ('store-sundaeria-heliocity', '찹쌀+토종(중)', 10000, 1, 10),
  ('store-sundaeria-heliocity', '찹쌀+김치(소)', 8000, 1, 11),
  ('store-sundaeria-heliocity', '찹쌀+김치(중)', 10000, 1, 12),
  ('store-sundaeria-heliocity', '토종+김치(소)', 9000, 1, 13),
  ('store-sundaeria-heliocity', '토종+김치(중)', 11000, 1, 14),
  ('store-sundaeria-heliocity', '가족세트', 15000, 1, 15);

DELETE FROM business_hours WHERE store_id = 'store-sundaeria-heliocity';

INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('store-sundaeria-heliocity', 0, '16:00', '20:00', 0),
  ('store-sundaeria-heliocity', 1, NULL, NULL, 1),
  ('store-sundaeria-heliocity', 2, NULL, NULL, 1),
  ('store-sundaeria-heliocity', 3, NULL, NULL, 1),
  ('store-sundaeria-heliocity', 4, NULL, NULL, 1),
  ('store-sundaeria-heliocity', 5, NULL, NULL, 1),
  ('store-sundaeria-heliocity', 6, NULL, NULL, 1);
