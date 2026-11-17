-- 오늘은순대(올림픽파크포레온) — 출처: blog.naver.com/goodluck_sin/224474776025
-- 화요일 / 강동 둔촌 포레온 3단지 앞 사거리 한전 앞
-- 메뉴판: 찹쌀 6천 / 모듬 7천 / 토종 8천 / 내장 7천. IG @t.sundae21

INSERT OR IGNORE INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  (
    'store-oneulsundae-foreon-dunchon',
    '오늘은순대(포레온·둔촌)',
    'sundae',
    '매주 화요일 올림픽파크포레온 3단지 앞 사거리 한전(KEPCO) 앞. 블로그 goodluck_sin 224474776025. IG @t.sundae21 / 신한 110-561-34159',
    NULL,
    'active',
    'expected'
  );

UPDATE stores
SET
  name = '오늘은순대(포레온·둔촌)',
  description = '매주 화요일 올림픽파크포레온 3단지 앞 사거리 한전(KEPCO) 앞. 블로그 goodluck_sin 224474776025. IG @t.sundae21 / 신한 110-561-34159',
  status = 'active',
  business_status = 'expected'
WHERE id = 'store-oneulsundae-foreon-dunchon';

INSERT OR IGNORE INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  (
    'store-oneulsundae-foreon-dunchon',
    37.5238,
    127.1375,
    '서울특별시 강동구 둔촌동',
    '올림픽파크포레온 3단지 앞 사거리 한전 앞(화)',
    '2026-11-17T00:00:00.000Z'
  );

UPDATE store_locations
SET
  lat = 37.5238,
  lng = 127.1375,
  address = '서울특별시 강동구 둔촌동',
  location_note = '올림픽파크포레온 3단지 앞 사거리 한전 앞(화)',
  updated_at = '2026-11-17T00:00:00.000Z'
WHERE store_id = 'store-oneulsundae-foreon-dunchon';

DELETE FROM menus WHERE store_id = 'store-oneulsundae-foreon-dunchon';

INSERT INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-oneulsundae-foreon-dunchon', '찹쌀순대', 6000, 1, 1),
  ('store-oneulsundae-foreon-dunchon', '모듬순대', 7000, 1, 2),
  ('store-oneulsundae-foreon-dunchon', '토종순대', 8000, 1, 3),
  ('store-oneulsundae-foreon-dunchon', '내장', 7000, 1, 4);

DELETE FROM business_hours WHERE store_id = 'store-oneulsundae-foreon-dunchon';

INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('store-oneulsundae-foreon-dunchon', 0, NULL, NULL, 1),
  ('store-oneulsundae-foreon-dunchon', 1, NULL, NULL, 1),
  ('store-oneulsundae-foreon-dunchon', 2, '17:00', '22:00', 0),
  ('store-oneulsundae-foreon-dunchon', 3, NULL, NULL, 1),
  ('store-oneulsundae-foreon-dunchon', 4, NULL, NULL, 1),
  ('store-oneulsundae-foreon-dunchon', 5, NULL, NULL, 1),
  ('store-oneulsundae-foreon-dunchon', 6, NULL, NULL, 1);
