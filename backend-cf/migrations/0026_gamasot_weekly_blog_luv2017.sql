-- 옛날가마솥순대 요일별 위치·메뉴 (출처: blog.naver.com/luv2017_/224453323592, 2026.10.28)
-- 연락: 010-5619-2478 / 카카오뱅크 3333-26-9768271 조성균

INSERT OR IGNORE INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  ('store-gamasot-samjeon-tlj', '옛날가마솥순대(삼전역 뚜레쥬르)', 'sundae', '월 17:00-21:00 삼전역 3번출구 뚜레쥬르 골목. 블로그 요일표(luv2017_ 224453323592). 010-5619-2478', NULL, 'active', 'expected'),
  ('store-gamasot-bangi-saemaul', '옛날가마솥순대(방이시장)', 'sundae', '월 21:40-24:00 방이시장 맞은편 새마을금고 주차장 앞. 블로그 요일표. 010-5619-2478', NULL, 'active', 'expected'),
  ('store-gamasot-dandae-park', '옛날가마솥순대(단대공원)', 'sundae', '화 17:00-20:00 성남 산성동 단대공원 입구. 블로그 요일표. 010-5619-2478', NULL, 'active', 'expected'),
  ('store-gamasot-nongol-gs', '옛날가마솥순대(논골로 GS25)', 'sundae', '화 20:30-21:50 성남 논골로 단대공영주차장 맞은편 GS25 앞. 블로그 요일표. 010-5619-2478', NULL, 'active', 'expected'),
  ('store-gamasot-bangi-middle', '옛날가마솥순대(방이중학교)', 'sundae', '화 22:20~ / 금 21:00-24:00 방이중학교 옆 오봉집 앞. 블로그 요일표. 010-5619-2478', NULL, 'active', 'expected'),
  ('store-gamasot-samjeon-fire', '옛날가마솥순대(삼전 소방서)', 'sundae', '수 17:00-23:00 삼전동 소방서 맞은편 골목·롯데부동산·올스타마트 인근. 블로그 요일표. 010-5619-2478', NULL, 'active', 'expected'),
  ('store-gamasot-seokchon-lake', '옛날가마솥순대(석촌 레이크호텔)', 'sundae', '목 17:00-23:00 석촌동 레이크호텔 골목 중간(담벼락). 블로그 요일표. 010-5619-2478', NULL, 'active', 'expected'),
  ('store-gamasot-myeonmok-doosan', '옛날가마솥순대(면목 두산아파트)', 'sundae', '금 17:00-21:00 면목동 두산아파트 앞. 블로그 요일표. 010-5619-2478', NULL, 'active', 'expected');

UPDATE stores
SET
  name = '옛날가마솥순대(삼전역 뚜레쥬르)',
  description = '월 17:00-21:00 삼전역 3번출구 뚜레쥬르 골목. 블로그 요일표(luv2017_ 224453323592). 010-5619-2478',
  status = 'active',
  business_status = 'expected'
WHERE id = 'store-gamasot-samjeon-tlj';

UPDATE stores
SET
  name = '옛날가마솥순대(방이시장)',
  description = '월 21:40-24:00 방이시장 맞은편 새마을금고 주차장 앞. 블로그 요일표. 010-5619-2478',
  status = 'active',
  business_status = 'expected'
WHERE id = 'store-gamasot-bangi-saemaul';

UPDATE stores
SET
  name = '옛날가마솥순대(단대공원)',
  description = '화 17:00-20:00 성남 산성동 단대공원 입구. 블로그 요일표. 010-5619-2478',
  status = 'active',
  business_status = 'expected'
WHERE id = 'store-gamasot-dandae-park';

UPDATE stores
SET
  name = '옛날가마솥순대(논골로 GS25)',
  description = '화 20:30-21:50 성남 논골로 단대공영주차장 맞은편 GS25 앞. 블로그 요일표. 010-5619-2478',
  status = 'active',
  business_status = 'expected'
WHERE id = 'store-gamasot-nongol-gs';

UPDATE stores
SET
  name = '옛날가마솥순대(방이중학교)',
  description = '화 22:20~ / 금 21:00-24:00 방이중학교 옆 오봉집 앞. 블로그 요일표. 010-5619-2478',
  status = 'active',
  business_status = 'expected'
WHERE id = 'store-gamasot-bangi-middle';

UPDATE stores
SET
  name = '옛날가마솥순대(삼전 소방서)',
  description = '수 17:00-23:00 삼전동 소방서 맞은편 골목·롯데부동산·올스타마트 인근. 블로그 요일표. 010-5619-2478',
  status = 'active',
  business_status = 'expected'
WHERE id = 'store-gamasot-samjeon-fire';

UPDATE stores
SET
  name = '옛날가마솥순대(석촌 레이크호텔)',
  description = '목 17:00-23:00 석촌동 레이크호텔 골목 중간(담벼락). 블로그 요일표. 010-5619-2478',
  status = 'active',
  business_status = 'expected'
WHERE id = 'store-gamasot-seokchon-lake';

UPDATE stores
SET
  name = '옛날가마솥순대(면목 두산아파트)',
  description = '금 17:00-21:00 면목동 두산아파트 앞. 블로그 요일표. 010-5619-2478',
  status = 'active',
  business_status = 'expected'
WHERE id = 'store-gamasot-myeonmok-doosan';

UPDATE stores SET status = 'inactive', business_status = 'unknown'
WHERE id IN (
  'store-sundae-truck-yeonhui',
  'store-sundae-truck-bangi',
  'store-sundae-truck-dandae',
  'store-sundae-truck-samjeon',
  'store-sundae-truck-seokchon',
  'store-sundae-truck-munjeong'
);

INSERT OR IGNORE INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  ('store-gamasot-samjeon-tlj', 37.5048, 127.0875, '서울특별시 송파구 삼전동', '삼전역 3번출구 뚜레쥬르 골목(월 17-21)', '2026-11-17T00:00:00.000Z'),
  ('store-gamasot-bangi-saemaul', 37.5148, 127.1155, '서울특별시 송파구 방이동', '방이시장 맞은편 새마을금고 주차장 앞(월 21:40-24)', '2026-11-17T00:00:00.000Z'),
  ('store-gamasot-dandae-park', 37.4530, 127.1590, '경기도 성남시 중원구 산성동', '단대공원 입구(화 17-20)', '2026-11-17T00:00:00.000Z'),
  ('store-gamasot-nongol-gs', 37.4515, 127.1570, '경기도 성남시 중원구 단대동', '논골로 단대공영주차장 맞은편 GS25 앞(화 20:30-21:50)', '2026-11-17T00:00:00.000Z'),
  ('store-gamasot-bangi-middle', 37.5112, 127.1240, '서울특별시 송파구 방이동', '방이중학교 옆 오봉집 앞(화 22:20~ / 금 21-24)', '2026-11-17T00:00:00.000Z'),
  ('store-gamasot-samjeon-fire', 37.5022, 127.0885, '서울특별시 송파구 삼전동', '소방서 맞은편 골목·롯데부동산·올스타마트 인근(수 17-23)', '2026-11-17T00:00:00.000Z'),
  ('store-gamasot-seokchon-lake', 37.5095, 127.1008, '서울특별시 송파구 석촌동', '레이크호텔 골목 중간 담벼락(목 17-23)', '2026-11-17T00:00:00.000Z'),
  ('store-gamasot-myeonmok-doosan', 37.5880, 127.0870, '서울특별시 중랑구 면목동', '면목동 두산아파트 앞(금 17-21)', '2026-11-17T00:00:00.000Z');

UPDATE store_locations
SET lat = 37.5048, lng = 127.0875, address = '서울특별시 송파구 삼전동',
    location_note = '삼전역 3번출구 뚜레쥬르 골목(월 17-21)', updated_at = '2026-11-17T00:00:00.000Z'
WHERE store_id = 'store-gamasot-samjeon-tlj';

UPDATE store_locations
SET lat = 37.5148, lng = 127.1155, address = '서울특별시 송파구 방이동',
    location_note = '방이시장 맞은편 새마을금고 주차장 앞(월 21:40-24)', updated_at = '2026-11-17T00:00:00.000Z'
WHERE store_id = 'store-gamasot-bangi-saemaul';

UPDATE store_locations
SET lat = 37.4530, lng = 127.1590, address = '경기도 성남시 중원구 산성동',
    location_note = '단대공원 입구(화 17-20)', updated_at = '2026-11-17T00:00:00.000Z'
WHERE store_id = 'store-gamasot-dandae-park';

UPDATE store_locations
SET lat = 37.4515, lng = 127.1570, address = '경기도 성남시 중원구 단대동',
    location_note = '논골로 단대공영주차장 맞은편 GS25 앞(화 20:30-21:50)', updated_at = '2026-11-17T00:00:00.000Z'
WHERE store_id = 'store-gamasot-nongol-gs';

UPDATE store_locations
SET lat = 37.5112, lng = 127.1240, address = '서울특별시 송파구 방이동',
    location_note = '방이중학교 옆 오봉집 앞(화 22:20~ / 금 21-24)', updated_at = '2026-11-17T00:00:00.000Z'
WHERE store_id = 'store-gamasot-bangi-middle';

UPDATE store_locations
SET lat = 37.5022, lng = 127.0885, address = '서울특별시 송파구 삼전동',
    location_note = '소방서 맞은편 골목·롯데부동산·올스타마트 인근(수 17-23)', updated_at = '2026-11-17T00:00:00.000Z'
WHERE store_id = 'store-gamasot-samjeon-fire';

UPDATE store_locations
SET lat = 37.5095, lng = 127.1008, address = '서울특별시 송파구 석촌동',
    location_note = '레이크호텔 골목 중간 담벼락(목 17-23)', updated_at = '2026-11-17T00:00:00.000Z'
WHERE store_id = 'store-gamasot-seokchon-lake';

UPDATE store_locations
SET lat = 37.5880, lng = 127.0870, address = '서울특별시 중랑구 면목동',
    location_note = '면목동 두산아파트 앞(금 17-21)', updated_at = '2026-11-17T00:00:00.000Z'
WHERE store_id = 'store-gamasot-myeonmok-doosan';

DELETE FROM menus WHERE store_id IN (
  'store-gamasot-samjeon-tlj',
  'store-gamasot-bangi-saemaul',
  'store-gamasot-dandae-park',
  'store-gamasot-nongol-gs',
  'store-gamasot-bangi-middle',
  'store-gamasot-samjeon-fire',
  'store-gamasot-seokchon-lake',
  'store-gamasot-myeonmok-doosan'
);

INSERT INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-gamasot-samjeon-tlj', '찰순대(소)', 5000, 1, 1),
  ('store-gamasot-samjeon-tlj', '찰순대(중)', 7000, 1, 2),
  ('store-gamasot-samjeon-tlj', '매운찰순대(소)', 6000, 1, 3),
  ('store-gamasot-samjeon-tlj', '토종야채순대(소)', 7000, 1, 4),
  ('store-gamasot-samjeon-tlj', '토종야채순대(중)', 10000, 1, 5),
  ('store-gamasot-samjeon-tlj', '김치순대', 8000, 1, 6),
  ('store-gamasot-samjeon-tlj', '고기순대', 8000, 1, 7),
  ('store-gamasot-samjeon-tlj', '찰+토종+내장', 8000, 1, 8),
  ('store-gamasot-samjeon-tlj', '찰+김치+내장', 8000, 1, 9),
  ('store-gamasot-samjeon-tlj', '찰+고기순대+내장', 8000, 1, 10),
  ('store-gamasot-samjeon-tlj', '내장(소)', 5000, 1, 11),
  ('store-gamasot-samjeon-tlj', '내장(중)', 8000, 1, 12),
  ('store-gamasot-samjeon-tlj', '편육(2인·500g)', 10000, 1, 13),
  ('store-gamasot-samjeon-tlj', '스페셜 선택모듬', 12000, 1, 14),
  ('store-gamasot-samjeon-tlj', '스페셜 전체모듬', 15000, 1, 15),
  ('store-gamasot-bangi-saemaul', '찰순대(소)', 5000, 1, 1),
  ('store-gamasot-bangi-saemaul', '찰순대(중)', 7000, 1, 2),
  ('store-gamasot-bangi-saemaul', '매운찰순대(소)', 6000, 1, 3),
  ('store-gamasot-bangi-saemaul', '토종야채순대(소)', 7000, 1, 4),
  ('store-gamasot-bangi-saemaul', '토종야채순대(중)', 10000, 1, 5),
  ('store-gamasot-bangi-saemaul', '김치순대', 8000, 1, 6),
  ('store-gamasot-bangi-saemaul', '고기순대', 8000, 1, 7),
  ('store-gamasot-bangi-saemaul', '찰+토종+내장', 8000, 1, 8),
  ('store-gamasot-bangi-saemaul', '찰+김치+내장', 8000, 1, 9),
  ('store-gamasot-bangi-saemaul', '찰+고기순대+내장', 8000, 1, 10),
  ('store-gamasot-bangi-saemaul', '내장(소)', 5000, 1, 11),
  ('store-gamasot-bangi-saemaul', '내장(중)', 8000, 1, 12),
  ('store-gamasot-bangi-saemaul', '편육(2인·500g)', 10000, 1, 13),
  ('store-gamasot-bangi-saemaul', '스페셜 선택모듬', 12000, 1, 14),
  ('store-gamasot-bangi-saemaul', '스페셜 전체모듬', 15000, 1, 15),
  ('store-gamasot-dandae-park', '찰순대(소)', 5000, 1, 1),
  ('store-gamasot-dandae-park', '찰순대(중)', 7000, 1, 2),
  ('store-gamasot-dandae-park', '매운찰순대(소)', 6000, 1, 3),
  ('store-gamasot-dandae-park', '토종야채순대(소)', 7000, 1, 4),
  ('store-gamasot-dandae-park', '토종야채순대(중)', 10000, 1, 5),
  ('store-gamasot-dandae-park', '김치순대', 8000, 1, 6),
  ('store-gamasot-dandae-park', '고기순대', 8000, 1, 7),
  ('store-gamasot-dandae-park', '찰+토종+내장', 8000, 1, 8),
  ('store-gamasot-dandae-park', '찰+김치+내장', 8000, 1, 9),
  ('store-gamasot-dandae-park', '찰+고기순대+내장', 8000, 1, 10),
  ('store-gamasot-dandae-park', '내장(소)', 5000, 1, 11),
  ('store-gamasot-dandae-park', '내장(중)', 8000, 1, 12),
  ('store-gamasot-dandae-park', '편육(2인·500g)', 10000, 1, 13),
  ('store-gamasot-dandae-park', '스페셜 선택모듬', 12000, 1, 14),
  ('store-gamasot-dandae-park', '스페셜 전체모듬', 15000, 1, 15),
  ('store-gamasot-nongol-gs', '찰순대(소)', 5000, 1, 1),
  ('store-gamasot-nongol-gs', '찰순대(중)', 7000, 1, 2),
  ('store-gamasot-nongol-gs', '매운찰순대(소)', 6000, 1, 3),
  ('store-gamasot-nongol-gs', '토종야채순대(소)', 7000, 1, 4),
  ('store-gamasot-nongol-gs', '토종야채순대(중)', 10000, 1, 5),
  ('store-gamasot-nongol-gs', '김치순대', 8000, 1, 6),
  ('store-gamasot-nongol-gs', '고기순대', 8000, 1, 7),
  ('store-gamasot-nongol-gs', '찰+토종+내장', 8000, 1, 8),
  ('store-gamasot-nongol-gs', '찰+김치+내장', 8000, 1, 9),
  ('store-gamasot-nongol-gs', '찰+고기순대+내장', 8000, 1, 10),
  ('store-gamasot-nongol-gs', '내장(소)', 5000, 1, 11),
  ('store-gamasot-nongol-gs', '내장(중)', 8000, 1, 12),
  ('store-gamasot-nongol-gs', '편육(2인·500g)', 10000, 1, 13),
  ('store-gamasot-nongol-gs', '스페셜 선택모듬', 12000, 1, 14),
  ('store-gamasot-nongol-gs', '스페셜 전체모듬', 15000, 1, 15),
  ('store-gamasot-bangi-middle', '찰순대(소)', 5000, 1, 1),
  ('store-gamasot-bangi-middle', '찰순대(중)', 7000, 1, 2),
  ('store-gamasot-bangi-middle', '매운찰순대(소)', 6000, 1, 3),
  ('store-gamasot-bangi-middle', '토종야채순대(소)', 7000, 1, 4),
  ('store-gamasot-bangi-middle', '토종야채순대(중)', 10000, 1, 5),
  ('store-gamasot-bangi-middle', '김치순대', 8000, 1, 6),
  ('store-gamasot-bangi-middle', '고기순대', 8000, 1, 7),
  ('store-gamasot-bangi-middle', '찰+토종+내장', 8000, 1, 8),
  ('store-gamasot-bangi-middle', '찰+김치+내장', 8000, 1, 9),
  ('store-gamasot-bangi-middle', '찰+고기순대+내장', 8000, 1, 10),
  ('store-gamasot-bangi-middle', '내장(소)', 5000, 1, 11),
  ('store-gamasot-bangi-middle', '내장(중)', 8000, 1, 12),
  ('store-gamasot-bangi-middle', '편육(2인·500g)', 10000, 1, 13),
  ('store-gamasot-bangi-middle', '스페셜 선택모듬', 12000, 1, 14),
  ('store-gamasot-bangi-middle', '스페셜 전체모듬', 15000, 1, 15),
  ('store-gamasot-samjeon-fire', '찰순대(소)', 5000, 1, 1),
  ('store-gamasot-samjeon-fire', '찰순대(중)', 7000, 1, 2),
  ('store-gamasot-samjeon-fire', '매운찰순대(소)', 6000, 1, 3),
  ('store-gamasot-samjeon-fire', '토종야채순대(소)', 7000, 1, 4),
  ('store-gamasot-samjeon-fire', '토종야채순대(중)', 10000, 1, 5),
  ('store-gamasot-samjeon-fire', '김치순대', 8000, 1, 6),
  ('store-gamasot-samjeon-fire', '고기순대', 8000, 1, 7),
  ('store-gamasot-samjeon-fire', '찰+토종+내장', 8000, 1, 8),
  ('store-gamasot-samjeon-fire', '찰+김치+내장', 8000, 1, 9),
  ('store-gamasot-samjeon-fire', '찰+고기순대+내장', 8000, 1, 10),
  ('store-gamasot-samjeon-fire', '내장(소)', 5000, 1, 11),
  ('store-gamasot-samjeon-fire', '내장(중)', 8000, 1, 12),
  ('store-gamasot-samjeon-fire', '편육(2인·500g)', 10000, 1, 13),
  ('store-gamasot-samjeon-fire', '스페셜 선택모듬', 12000, 1, 14),
  ('store-gamasot-samjeon-fire', '스페셜 전체모듬', 15000, 1, 15),
  ('store-gamasot-seokchon-lake', '찰순대(소)', 5000, 1, 1),
  ('store-gamasot-seokchon-lake', '찰순대(중)', 7000, 1, 2),
  ('store-gamasot-seokchon-lake', '매운찰순대(소)', 6000, 1, 3),
  ('store-gamasot-seokchon-lake', '토종야채순대(소)', 7000, 1, 4),
  ('store-gamasot-seokchon-lake', '토종야채순대(중)', 10000, 1, 5),
  ('store-gamasot-seokchon-lake', '김치순대', 8000, 1, 6),
  ('store-gamasot-seokchon-lake', '고기순대', 8000, 1, 7),
  ('store-gamasot-seokchon-lake', '찰+토종+내장', 8000, 1, 8),
  ('store-gamasot-seokchon-lake', '찰+김치+내장', 8000, 1, 9),
  ('store-gamasot-seokchon-lake', '찰+고기순대+내장', 8000, 1, 10),
  ('store-gamasot-seokchon-lake', '내장(소)', 5000, 1, 11),
  ('store-gamasot-seokchon-lake', '내장(중)', 8000, 1, 12),
  ('store-gamasot-seokchon-lake', '편육(2인·500g)', 10000, 1, 13),
  ('store-gamasot-seokchon-lake', '스페셜 선택모듬', 12000, 1, 14),
  ('store-gamasot-seokchon-lake', '스페셜 전체모듬', 15000, 1, 15),
  ('store-gamasot-myeonmok-doosan', '찰순대(소)', 5000, 1, 1),
  ('store-gamasot-myeonmok-doosan', '찰순대(중)', 7000, 1, 2),
  ('store-gamasot-myeonmok-doosan', '매운찰순대(소)', 6000, 1, 3),
  ('store-gamasot-myeonmok-doosan', '토종야채순대(소)', 7000, 1, 4),
  ('store-gamasot-myeonmok-doosan', '토종야채순대(중)', 10000, 1, 5),
  ('store-gamasot-myeonmok-doosan', '김치순대', 8000, 1, 6),
  ('store-gamasot-myeonmok-doosan', '고기순대', 8000, 1, 7),
  ('store-gamasot-myeonmok-doosan', '찰+토종+내장', 8000, 1, 8),
  ('store-gamasot-myeonmok-doosan', '찰+김치+내장', 8000, 1, 9),
  ('store-gamasot-myeonmok-doosan', '찰+고기순대+내장', 8000, 1, 10),
  ('store-gamasot-myeonmok-doosan', '내장(소)', 5000, 1, 11),
  ('store-gamasot-myeonmok-doosan', '내장(중)', 8000, 1, 12),
  ('store-gamasot-myeonmok-doosan', '편육(2인·500g)', 10000, 1, 13),
  ('store-gamasot-myeonmok-doosan', '스페셜 선택모듬', 12000, 1, 14),
  ('store-gamasot-myeonmok-doosan', '스페셜 전체모듬', 15000, 1, 15);

DELETE FROM business_hours WHERE store_id IN (
  'store-gamasot-samjeon-tlj',
  'store-gamasot-bangi-saemaul',
  'store-gamasot-dandae-park',
  'store-gamasot-nongol-gs',
  'store-gamasot-bangi-middle',
  'store-gamasot-samjeon-fire',
  'store-gamasot-seokchon-lake',
  'store-gamasot-myeonmok-doosan'
);

INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('store-gamasot-samjeon-tlj', 0, NULL, NULL, 1),
  ('store-gamasot-samjeon-tlj', 1, '17:00', '21:00', 0),
  ('store-gamasot-samjeon-tlj', 2, NULL, NULL, 1),
  ('store-gamasot-samjeon-tlj', 3, NULL, NULL, 1),
  ('store-gamasot-samjeon-tlj', 4, NULL, NULL, 1),
  ('store-gamasot-samjeon-tlj', 5, NULL, NULL, 1),
  ('store-gamasot-samjeon-tlj', 6, NULL, NULL, 1),
  ('store-gamasot-bangi-saemaul', 0, NULL, NULL, 1),
  ('store-gamasot-bangi-saemaul', 1, '21:40', '24:00', 0),
  ('store-gamasot-bangi-saemaul', 2, NULL, NULL, 1),
  ('store-gamasot-bangi-saemaul', 3, NULL, NULL, 1),
  ('store-gamasot-bangi-saemaul', 4, NULL, NULL, 1),
  ('store-gamasot-bangi-saemaul', 5, NULL, NULL, 1),
  ('store-gamasot-bangi-saemaul', 6, NULL, NULL, 1),
  ('store-gamasot-dandae-park', 0, NULL, NULL, 1),
  ('store-gamasot-dandae-park', 1, NULL, NULL, 1),
  ('store-gamasot-dandae-park', 2, '17:00', '20:00', 0),
  ('store-gamasot-dandae-park', 3, NULL, NULL, 1),
  ('store-gamasot-dandae-park', 4, NULL, NULL, 1),
  ('store-gamasot-dandae-park', 5, NULL, NULL, 1),
  ('store-gamasot-dandae-park', 6, NULL, NULL, 1),
  ('store-gamasot-nongol-gs', 0, NULL, NULL, 1),
  ('store-gamasot-nongol-gs', 1, NULL, NULL, 1),
  ('store-gamasot-nongol-gs', 2, '20:30', '21:50', 0),
  ('store-gamasot-nongol-gs', 3, NULL, NULL, 1),
  ('store-gamasot-nongol-gs', 4, NULL, NULL, 1),
  ('store-gamasot-nongol-gs', 5, NULL, NULL, 1),
  ('store-gamasot-nongol-gs', 6, NULL, NULL, 1),
  ('store-gamasot-bangi-middle', 0, NULL, NULL, 1),
  ('store-gamasot-bangi-middle', 1, NULL, NULL, 1),
  ('store-gamasot-bangi-middle', 2, '22:20', '24:00', 0),
  ('store-gamasot-bangi-middle', 3, NULL, NULL, 1),
  ('store-gamasot-bangi-middle', 4, NULL, NULL, 1),
  ('store-gamasot-bangi-middle', 5, '21:00', '24:00', 0),
  ('store-gamasot-bangi-middle', 6, NULL, NULL, 1),
  ('store-gamasot-samjeon-fire', 0, NULL, NULL, 1),
  ('store-gamasot-samjeon-fire', 1, NULL, NULL, 1),
  ('store-gamasot-samjeon-fire', 2, NULL, NULL, 1),
  ('store-gamasot-samjeon-fire', 3, '17:00', '23:00', 0),
  ('store-gamasot-samjeon-fire', 4, NULL, NULL, 1),
  ('store-gamasot-samjeon-fire', 5, NULL, NULL, 1),
  ('store-gamasot-samjeon-fire', 6, NULL, NULL, 1),
  ('store-gamasot-seokchon-lake', 0, NULL, NULL, 1),
  ('store-gamasot-seokchon-lake', 1, NULL, NULL, 1),
  ('store-gamasot-seokchon-lake', 2, NULL, NULL, 1),
  ('store-gamasot-seokchon-lake', 3, NULL, NULL, 1),
  ('store-gamasot-seokchon-lake', 4, '17:00', '23:00', 0),
  ('store-gamasot-seokchon-lake', 5, NULL, NULL, 1),
  ('store-gamasot-seokchon-lake', 6, NULL, NULL, 1),
  ('store-gamasot-myeonmok-doosan', 0, NULL, NULL, 1),
  ('store-gamasot-myeonmok-doosan', 1, NULL, NULL, 1),
  ('store-gamasot-myeonmok-doosan', 2, NULL, NULL, 1),
  ('store-gamasot-myeonmok-doosan', 3, NULL, NULL, 1),
  ('store-gamasot-myeonmok-doosan', 4, NULL, NULL, 1),
  ('store-gamasot-myeonmok-doosan', 5, '17:00', '21:00', 0),
  ('store-gamasot-myeonmok-doosan', 6, NULL, NULL, 1);
