-- 기존 가상 시드 제거 후 2026 공개자료 기반 서울 판매점 적재
DELETE FROM schedule_exceptions;
DELETE FROM menus;
DELETE FROM business_hours;
DELETE FROM store_locations;
DELETE FROM stores;

INSERT INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  (
    'store-gamasot-bongeunsa',
    '옛날가마솥순대',
    'sundae',
    '봉은사역·삼성동 풍림2차 인근. 오늘트럭 근거 2026-10-27',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  ),
  (
    'store-yeomchang-sundae',
    '염창 순대푸드트럭',
    'sundae',
    '수요일 출몰. 블로그 후기 2026-09',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-wirye-sundae',
    '순대먹는날',
    'sundae',
    '위례·거여 순환. 오늘트럭 메뉴 확인 2026-07-03',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  ),
  (
    'store-jootak-chicken',
    '주탉',
    'chicken',
    '광진 자양 전기구이 통닭. 위치는 인스타 스토리 공유',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'confirmed_open'
  ),
  (
    'store-sindang-chicken',
    '신당역 통닭트럭',
    'chicken',
    '바베큐 통닭·목삼겹. 오늘트럭 근거 2026-11-04',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  ),
  (
    'store-amsa-chicken',
    '암사 통닭바베큐',
    'chicken',
    '당근 동네생활 제보. 수요일 출몰 언급',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-kingdakko',
    '킹다꼬',
    'other',
    '송파 방이 타코야끼. 인스타 @king_takoyakii · 블로그 2026-01',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-tacoboy',
    '타코보이',
    'other',
    '아차산역 타코야끼 트럭. 화요일 출몰 후기',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  );

INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  ('store-gamasot-bongeunsa', 37.5142, 127.0602, '서울특별시 강남구 삼성동', '봉은사역 3·4번 출구 인근', '2026-10-27T00:00:00.000Z'),
  ('store-yeomchang-sundae', 37.5618, 126.8715, '서울특별시 강서구 공항대로75길 42', '염창 대림아파트 인근', '2026-09-02T00:00:00.000Z'),
  ('store-wirye-sundae', 37.4765, 127.1432, '서울특별시 송파구 위례동', '위례 31단지·포레샤인 CU 인근', '2026-07-03T00:00:00.000Z'),
  ('store-jootak-chicken', 37.5407, 127.0707, '서울특별시 광진구 자양동', '건대입구·자양 일대 (당일 스토리 확인)', '2026-02-21T00:00:00.000Z'),
  ('store-sindang-chicken', 37.5656, 127.0194, '서울특별시 중구 신당동', '신당역 11번 출구 인근', '2026-11-04T00:00:00.000Z'),
  ('store-amsa-chicken', 37.5574, 127.1298, '서울특별시 강동구 암사동', '암사역사공원역 인근', '2026-01-01T00:00:00.000Z'),
  ('store-kingdakko', 37.5085, 127.1268, '서울특별시 송파구 방이동', '방이전통시장 맞은편 등 (당일 확인)', '2026-01-28T00:00:00.000Z'),
  ('store-tacoboy', 37.5517, 127.0895, '서울특별시 광진구 구의동', '아차산역 3번 출구 앞', '2025-10-29T00:00:00.000Z');

-- 요일: 0=일 … 6=토
INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('store-gamasot-bongeunsa', 0, NULL, NULL, 1),
  ('store-gamasot-bongeunsa', 1, '17:00', '22:00', 0),
  ('store-gamasot-bongeunsa', 2, NULL, NULL, 1),
  ('store-gamasot-bongeunsa', 3, NULL, NULL, 1),
  ('store-gamasot-bongeunsa', 4, NULL, NULL, 1),
  ('store-gamasot-bongeunsa', 5, NULL, NULL, 1),
  ('store-gamasot-bongeunsa', 6, NULL, NULL, 1),

  ('store-yeomchang-sundae', 0, NULL, NULL, 1),
  ('store-yeomchang-sundae', 1, NULL, NULL, 1),
  ('store-yeomchang-sundae', 2, NULL, NULL, 1),
  ('store-yeomchang-sundae', 3, '18:00', '23:00', 0),
  ('store-yeomchang-sundae', 4, NULL, NULL, 1),
  ('store-yeomchang-sundae', 5, NULL, NULL, 1),
  ('store-yeomchang-sundae', 6, NULL, NULL, 1),

  ('store-wirye-sundae', 0, '15:30', '20:00', 0),
  ('store-wirye-sundae', 1, NULL, NULL, 1),
  ('store-wirye-sundae', 2, NULL, NULL, 1),
  ('store-wirye-sundae', 3, '15:30', '20:00', 0),
  ('store-wirye-sundae', 4, NULL, NULL, 1),
  ('store-wirye-sundae', 5, '15:30', '20:00', 0),
  ('store-wirye-sundae', 6, NULL, NULL, 1),

  ('store-jootak-chicken', 0, NULL, NULL, 1),
  ('store-jootak-chicken', 1, '17:00', '22:00', 0),
  ('store-jootak-chicken', 2, '17:00', '22:00', 0),
  ('store-jootak-chicken', 3, '17:00', '22:00', 0),
  ('store-jootak-chicken', 4, NULL, NULL, 1),
  ('store-jootak-chicken', 5, '17:00', '22:00', 0),
  ('store-jootak-chicken', 6, '17:00', '22:00', 0),

  ('store-sindang-chicken', 0, NULL, NULL, 1),
  ('store-sindang-chicken', 1, NULL, NULL, 1),
  ('store-sindang-chicken', 2, '17:00', '22:00', 0),
  ('store-sindang-chicken', 3, NULL, NULL, 1),
  ('store-sindang-chicken', 4, NULL, NULL, 1),
  ('store-sindang-chicken', 5, NULL, NULL, 1),
  ('store-sindang-chicken', 6, NULL, NULL, 1),

  ('store-amsa-chicken', 0, NULL, NULL, 1),
  ('store-amsa-chicken', 1, NULL, NULL, 1),
  ('store-amsa-chicken', 2, NULL, NULL, 1),
  ('store-amsa-chicken', 3, '17:00', '22:00', 0),
  ('store-amsa-chicken', 4, NULL, NULL, 1),
  ('store-amsa-chicken', 5, NULL, NULL, 1),
  ('store-amsa-chicken', 6, NULL, NULL, 1),

  ('store-kingdakko', 0, NULL, NULL, 1),
  ('store-kingdakko', 1, NULL, NULL, 1),
  ('store-kingdakko', 2, '17:00', '22:00', 0),
  ('store-kingdakko', 3, NULL, NULL, 1),
  ('store-kingdakko', 4, '17:00', '22:00', 0),
  ('store-kingdakko', 5, NULL, NULL, 1),
  ('store-kingdakko', 6, NULL, NULL, 1),

  ('store-tacoboy', 0, NULL, NULL, 1),
  ('store-tacoboy', 1, NULL, NULL, 1),
  ('store-tacoboy', 2, '17:00', '22:00', 0),
  ('store-tacoboy', 3, NULL, NULL, 1),
  ('store-tacoboy', 4, NULL, NULL, 1),
  ('store-tacoboy', 5, NULL, NULL, 1),
  ('store-tacoboy', 6, NULL, NULL, 1);

INSERT INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-gamasot-bongeunsa', '찰순대 소', 6000, 1, 1),
  ('store-gamasot-bongeunsa', '모듬순대 소', 8000, 1, 2),
  ('store-gamasot-bongeunsa', '내장 소', 8000, 1, 3),

  ('store-yeomchang-sundae', '찹쌀순대', 8000, 1, 1),
  ('store-yeomchang-sundae', '부속 추가', 4000, 1, 2),

  ('store-wirye-sundae', '찰진순대 세트 중', 7000, 1, 1),
  ('store-wirye-sundae', '순대모둠 세트 중', 7000, 1, 2),
  ('store-wirye-sundae', '내장모둠', 7000, 1, 3),

  ('store-jootak-chicken', '통닭 한마리', 9000, 1, 1),
  ('store-jootak-chicken', '통닭 두마리', 17000, 1, 2),
  ('store-jootak-chicken', '통삼겹 900g', 16000, 1, 3),

  ('store-sindang-chicken', '바베큐 통닭', 10000, 1, 1),
  ('store-sindang-chicken', '목삼겹', 15000, 1, 2),

  ('store-amsa-chicken', '통닭 1마리', 9000, 1, 1),
  ('store-amsa-chicken', '통닭 2마리', 16000, 1, 2),
  ('store-amsa-chicken', '삼겹살 바베큐', 15000, 1, 3),

  ('store-kingdakko', '타코야끼 5개', 3500, 1, 1),
  ('store-kingdakko', '타코야끼 20개', 12000, 1, 2),

  ('store-tacoboy', '타코야끼 소 8알', 5000, 1, 1),
  ('store-tacoboy', '타코야끼 중 14알', 8000, 1, 2),
  ('store-tacoboy', '타코야끼 대 18알', 10000, 1, 3);
