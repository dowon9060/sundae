-- 추가 수집: 오늘트럭·당근 동네생활 2026 공개 자료
-- 신당 메뉴 가격 보정 + 신규 판매점

UPDATE menus SET price = 17000 WHERE store_id = 'store-sindang-chicken' AND name = '목삼겹';
INSERT INTO menus (store_id, name, price, is_available, sort_order)
SELECT 'store-sindang-chicken', '찹쌀통닭', 11000, 1, 3
WHERE NOT EXISTS (
  SELECT 1 FROM menus WHERE store_id = 'store-sindang-chicken' AND name = '찹쌀통닭'
);

INSERT INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  (
    'store-gamasot-sangbong',
    '옛날가마솥순대(상봉·면목)',
    'sundae',
    '상봉·면목 순환. 오늘트럭 메뉴 확인 2026-10-26',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  ),
  (
    'store-yaksu-sundae',
    '약수·버티고개 순대트럭',
    'sundae',
    '약수역 인근. 오늘트럭 근거 2026-11-04',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  ),
  (
    'store-mapo-sundae',
    '마포역 순대트럭',
    'sundae',
    '마포역 3번 출구. 당근 동네생활 제보 · 토 16:30~24:00',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-eunpyeong-gamasot',
    '은평 가마솥순대',
    'sundae',
    '응암·증산·연신내 일대. 당근 동네생활 제보',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-yangjae-sundae',
    '양재 쿨마트 순대트럭',
    'sundae',
    '양재 쿨마트 앞. 오늘트럭 근거 2026-09-20',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  ),
  (
    'store-bonghwasan-chicken',
    '봉화산 전기구이 통닭',
    'chicken',
    '봉화산역 3번 출구. 오늘트럭 근거 2026-02-03 · 요일표 2026-11-05',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  );

INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  ('store-gamasot-sangbong', 37.5964, 127.0852, '서울특별시 중랑구 상봉동', '상봉역 맘스터치 근처 (화·금) / 면목두산 CU 인근(금)', '2026-10-26T00:00:00.000Z'),
  ('store-yaksu-sundae', 37.5546, 127.0105, '서울특별시 중구 신당동', '약수역 3번 출구 뒤 동호로 · 스타벅스 근처', '2026-11-04T00:00:00.000Z'),
  ('store-mapo-sundae', 37.5397, 126.9459, '서울특별시 마포구 도화동', '마포역 3번 출구', '2026-01-01T00:00:00.000Z'),
  ('store-eunpyeong-gamasot', 37.5985, 126.9156, '서울특별시 은평구 응암동', '응암역 2번 씨스페이스·은평이마트·증산 SK대리점 등 (당일 확인)', '2026-01-01T00:00:00.000Z'),
  ('store-yangjae-sundae', 37.4844, 127.0345, '서울특별시 서초구 양재동', '양재 쿨마트 앞', '2026-09-20T00:00:00.000Z'),
  ('store-bonghwasan-chicken', 37.6173, 127.0919, '서울특별시 중랑구 신내동', '봉화산역 3번 출구 · 사거리 횡단보도 6단지 근처', '2026-11-05T00:00:00.000Z');

INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('store-gamasot-sangbong', 0, NULL, NULL, 1),
  ('store-gamasot-sangbong', 1, NULL, NULL, 1),
  ('store-gamasot-sangbong', 2, '17:00', '22:00', 0),
  ('store-gamasot-sangbong', 3, NULL, NULL, 1),
  ('store-gamasot-sangbong', 4, NULL, NULL, 1),
  ('store-gamasot-sangbong', 5, '18:00', '20:00', 0),
  ('store-gamasot-sangbong', 6, NULL, NULL, 1),

  ('store-yaksu-sundae', 0, NULL, NULL, 1),
  ('store-yaksu-sundae', 1, NULL, NULL, 1),
  ('store-yaksu-sundae', 2, NULL, NULL, 1),
  ('store-yaksu-sundae', 3, '17:00', '22:00', 0),
  ('store-yaksu-sundae', 4, NULL, NULL, 1),
  ('store-yaksu-sundae', 5, NULL, NULL, 1),
  ('store-yaksu-sundae', 6, NULL, NULL, 1),

  ('store-mapo-sundae', 0, NULL, NULL, 1),
  ('store-mapo-sundae', 1, NULL, NULL, 1),
  ('store-mapo-sundae', 2, NULL, NULL, 1),
  ('store-mapo-sundae', 3, NULL, NULL, 1),
  ('store-mapo-sundae', 4, NULL, NULL, 1),
  ('store-mapo-sundae', 5, NULL, NULL, 1),
  ('store-mapo-sundae', 6, '16:30', '24:00', 0),

  ('store-eunpyeong-gamasot', 0, '15:00', '22:00', 0),
  ('store-eunpyeong-gamasot', 1, '15:00', '22:00', 0),
  ('store-eunpyeong-gamasot', 2, '15:00', '22:00', 0),
  ('store-eunpyeong-gamasot', 3, '15:00', '22:00', 0),
  ('store-eunpyeong-gamasot', 4, '15:00', '22:00', 0),
  ('store-eunpyeong-gamasot', 5, '15:00', '22:00', 0),
  ('store-eunpyeong-gamasot', 6, '15:00', '22:00', 0),

  ('store-yangjae-sundae', 0, '16:30', '22:00', 0),
  ('store-yangjae-sundae', 1, NULL, NULL, 1),
  ('store-yangjae-sundae', 2, NULL, NULL, 1),
  ('store-yangjae-sundae', 3, NULL, NULL, 1),
  ('store-yangjae-sundae', 4, NULL, NULL, 1),
  ('store-yangjae-sundae', 5, NULL, NULL, 1),
  ('store-yangjae-sundae', 6, NULL, NULL, 1),

  ('store-bonghwasan-chicken', 0, NULL, NULL, 1),
  ('store-bonghwasan-chicken', 1, NULL, NULL, 1),
  ('store-bonghwasan-chicken', 2, NULL, NULL, 1),
  ('store-bonghwasan-chicken', 3, NULL, NULL, 1),
  ('store-bonghwasan-chicken', 4, '19:00', '22:00', 0),
  ('store-bonghwasan-chicken', 5, NULL, NULL, 1),
  ('store-bonghwasan-chicken', 6, NULL, NULL, 1);

INSERT INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-gamasot-sangbong', '찰순대 소', 7000, 1, 1),
  ('store-gamasot-sangbong', '모듬순대 소', 9000, 1, 2),
  ('store-gamasot-sangbong', '김치순대모음 소', 10000, 1, 3),

  ('store-yaksu-sundae', '순대', 7000, 1, 1),
  ('store-yaksu-sundae', '내장', 8000, 1, 2),

  ('store-mapo-sundae', '찹쌀순대', 8000, 1, 1),
  ('store-mapo-sundae', '모듬순대', 10000, 1, 2),

  ('store-eunpyeong-gamasot', '가마솥 찰순대', 7000, 1, 1),
  ('store-eunpyeong-gamasot', '모듬순대', 9000, 1, 2),

  ('store-yangjae-sundae', '컵순대', 5000, 1, 1),

  ('store-bonghwasan-chicken', '통닭 한 마리', 10000, 1, 1),
  ('store-bonghwasan-chicken', '통닭 두 마리', 18000, 1, 2),
  ('store-bonghwasan-chicken', '목살', 15000, 1, 3);

-- 킹다꼬 위치 메모 보강 (문정·방이 순환)
UPDATE store_locations
SET location_note = '방이·마천·문정 순환 (목 문정역 2번 등 · 전화 확인)',
    updated_at = '2026-01-28T00:00:00.000Z'
WHERE store_id = 'store-kingdakko';
