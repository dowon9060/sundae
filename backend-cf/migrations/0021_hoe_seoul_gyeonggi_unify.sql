-- 회 카테고리 명칭 통일(오징어회 → 회) + 서울·경기 회 트럭 보강 + 위치 복구

-- 1) 표시명 통일
UPDATE stores
SET name = REPLACE(name, '오징어회트럭', '회트럭')
WHERE category = 'hoe' AND name LIKE '%오징어회트럭%';

UPDATE stores
SET name = REPLACE(name, '오징어회', '회')
WHERE category = 'hoe' AND name LIKE '%오징어회%';

UPDATE menus
SET name = CASE
  WHEN name = '오징어회' THEN '회'
  WHEN name = '오징어·낙지회' THEN '회·낙지회'
  ELSE name
END
WHERE store_id IN (SELECT id FROM stores WHERE category = 'hoe')
  AND (name LIKE '%오징어회%' OR name = '오징어·낙지회');

-- 2) 기존 회 트럭 위치 복구 (0020 stores 재생성 시 CASCADE 유실 대응)
INSERT OR IGNORE INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  ('store-hoe-pyeongtaek-segyo', 37.0075, 127.0720, '경기도 평택시 세교동', '힐스테이트 세교 1차 앞. 금요일 제보(변동)', '2026-11-16T00:00:00.000Z'),
  ('store-hoe-pyeongtaek-godeok', 37.0350, 127.0550, '경기도 평택시 고덕면 여염리', '여염리 4229-1 근처 제보', '2026-11-16T00:00:00.000Z'),
  ('store-hoe-pyeongtaek-central', 37.0550, 127.0480, '경기도 평택시 고덕동', '센트럴자이 5단지 상가 일대 제보', '2026-11-16T00:00:00.000Z'),
  ('store-hoe-jinju-central', 35.1798, 128.108, '경상남도 진주시', '센트럴·프리미어웰가 사이', '2026-11-16T00:00:00.000Z'),
  ('store-hoe-jinju-pyeonggeo', 35.1805, 128.07, '경상남도 진주시 평거동', '엠코타운', '2026-11-16T00:00:00.000Z'),
  ('store-hoe-changwon-gaeum', 35.2215, 128.695, '경상남도 창원시 성산구', '자이·한화', '2026-11-16T00:00:00.000Z'),
  ('store-hoe-changwon-sapa', 35.221, 128.675, '경상남도 창원시 사파동', '사파동성 후문', '2026-11-16T00:00:00.000Z'),
  ('store-hoe-cheongju-dongnam', 36.615, 127.51, '충청북도 청주시', '동남·분평', '2026-11-16T00:00:00.000Z');

-- 3) 서울·경기 추가 제보 (당근 동네생활 정리분, 좌표는 랜드마크 근사)
INSERT OR IGNORE INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  (
    'store-hoe-pyeongtaek-yongi',
    '평택 용이 회트럭',
    'hoe',
    '용이동 노브랜드 앞. 당근 평택 이충·용이 제보. 저렴·양많음 후기',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-hoe-pyeongtaek-dongmun',
    '평택 동문디이스트 회트럭',
    'hoe',
    '동문디이스트 5단지 일대. 당근 최근 방문 제보',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-hoe-pyeongtaek-sosa',
    '평택 소사 회트럭',
    'hoe',
    '소사동 효성해링턴 2차 앞. 당근 제보',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-hoe-anyang-poilsamsung',
    '안양 인덕원 회트럭',
    'hoe',
    '인덕원 삼성아파트 일대 해산물 트럭 제보(당근 포일동). 회·튀김 혼재 가능·당일 확인',
    NULL,
    'active',
    'unknown'
  ),
  (
    'store-hoe-bucheon-okgil',
    '부천 옥길·중동 회트럭',
    'hoe',
    '옥길·중동 이마트 출차 쪽·원미산 입구 일대 제보. 버터구이 오징어와 별개 회트럭 여부 당일 확인',
    NULL,
    'active',
    'unknown'
  );

INSERT OR IGNORE INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  ('store-hoe-pyeongtaek-yongi', 37.0518, 127.0575, '경기도 평택시 용이동', '용이동 노브랜드 앞', '2026-11-16T00:00:00.000Z'),
  ('store-hoe-pyeongtaek-dongmun', 37.0215, 127.1120, '경기도 평택시 비전동', '동문디이스트 5단지 일대', '2026-11-16T00:00:00.000Z'),
  ('store-hoe-pyeongtaek-sosa', 36.9945, 127.1125, '경기도 평택시 소사동', '효성해링턴플레이스 2차 앞', '2026-11-16T00:00:00.000Z'),
  ('store-hoe-anyang-poilsamsung', 37.4010, 126.9765, '경기도 안양시 동안구 평촌동', '인덕원 삼성아파트 앞 일대', '2026-11-16T00:00:00.000Z'),
  ('store-hoe-bucheon-okgil', 37.4685, 126.8175, '경기도 부천시 원미구 옥길동', '옥길·중동 이마트 출차·원미산 입구 순환', '2026-11-16T00:00:00.000Z');

INSERT OR IGNORE INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-hoe-pyeongtaek-yongi', '회', 15000, 1, 1),
  ('store-hoe-pyeongtaek-dongmun', '회', 15000, 1, 1),
  ('store-hoe-pyeongtaek-sosa', '회', 15000, 1, 1),
  ('store-hoe-anyang-poilsamsung', '회', 15000, 1, 1),
  ('store-hoe-bucheon-okgil', '회', 15000, 1, 1);

-- 영업시간: 평택 추가분은 오후~저녁 유동, 안양·부천은 미확인(휴무 표기)
INSERT OR IGNORE INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('store-hoe-pyeongtaek-yongi', 0, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-yongi', 1, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-yongi', 2, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-yongi', 3, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-yongi', 4, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-yongi', 5, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-yongi', 6, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-dongmun', 0, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-dongmun', 1, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-dongmun', 2, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-dongmun', 3, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-dongmun', 4, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-dongmun', 5, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-dongmun', 6, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-sosa', 0, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-sosa', 1, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-sosa', 2, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-sosa', 3, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-sosa', 4, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-sosa', 5, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-sosa', 6, '16:00', '21:00', 0),
  ('store-hoe-anyang-poilsamsung', 0, NULL, NULL, 1),
  ('store-hoe-anyang-poilsamsung', 1, NULL, NULL, 1),
  ('store-hoe-anyang-poilsamsung', 2, NULL, NULL, 1),
  ('store-hoe-anyang-poilsamsung', 3, NULL, NULL, 1),
  ('store-hoe-anyang-poilsamsung', 4, NULL, NULL, 1),
  ('store-hoe-anyang-poilsamsung', 5, NULL, NULL, 1),
  ('store-hoe-anyang-poilsamsung', 6, NULL, NULL, 1),
  ('store-hoe-bucheon-okgil', 0, NULL, NULL, 1),
  ('store-hoe-bucheon-okgil', 1, NULL, NULL, 1),
  ('store-hoe-bucheon-okgil', 2, NULL, NULL, 1),
  ('store-hoe-bucheon-okgil', 3, NULL, NULL, 1),
  ('store-hoe-bucheon-okgil', 4, NULL, NULL, 1),
  ('store-hoe-bucheon-okgil', 5, NULL, NULL, 1),
  ('store-hoe-bucheon-okgil', 6, NULL, NULL, 1);
