-- 목업 예시 판매점
INSERT INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  (
    'store-yeoksam-sundae',
    '역삼 순대차',
    'sundae',
    '역삼역 인근에서 영업하는 순대·내장·떡볶이 이동식 판매점',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    'active',
    'confirmed_open'
  ),
  (
    'store-gangnam-chicken',
    '참숯 통닭차',
    'chicken',
    '강남역 인근 전기구이 통닭 이동식 판매점',
    'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
    'active',
    'unknown'
  );

INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  (
    'store-yeoksam-sundae',
    37.5007,
    127.0365,
    '서울특별시 강남구 역삼동',
    '역삼역 인근',
    datetime('now')
  ),
  (
    'store-gangnam-chicken',
    37.4979,
    127.0276,
    '서울특별시 강남구 역삼동',
    '강남역 인근',
    datetime('now')
  );

-- 역삼 순대차: 월화목 17-23, 금토 17-24, 수일 휴무
INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('store-yeoksam-sundae', 0, NULL, NULL, 1),
  ('store-yeoksam-sundae', 1, '17:00', '23:00', 0),
  ('store-yeoksam-sundae', 2, '17:00', '23:00', 0),
  ('store-yeoksam-sundae', 3, NULL, NULL, 1),
  ('store-yeoksam-sundae', 4, '17:00', '23:00', 0),
  ('store-yeoksam-sundae', 5, '17:00', '24:00', 0),
  ('store-yeoksam-sundae', 6, '17:00', '24:00', 0);

-- 참숯 통닭차: 매일 16-22
INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('store-gangnam-chicken', 0, '16:00', '22:00', 0),
  ('store-gangnam-chicken', 1, '16:00', '22:00', 0),
  ('store-gangnam-chicken', 2, '16:00', '22:00', 0),
  ('store-gangnam-chicken', 3, '16:00', '22:00', 0),
  ('store-gangnam-chicken', 4, '16:00', '22:00', 0),
  ('store-gangnam-chicken', 5, '16:00', '22:00', 0),
  ('store-gangnam-chicken', 6, '16:00', '22:00', 0);

INSERT INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-yeoksam-sundae', '찰순대', 5000, 1, 1),
  ('store-yeoksam-sundae', '모둠순대', 7000, 1, 2),
  ('store-yeoksam-sundae', '내장 모듬', 6000, 1, 3),
  ('store-gangnam-chicken', '전기구이 통닭', 18000, 1, 1),
  ('store-gangnam-chicken', '반마리', 10000, 1, 2);
