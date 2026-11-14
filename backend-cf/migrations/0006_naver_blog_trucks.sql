-- 네이버 블로그 공개 후기 기반 추가 (서울)
-- 카페 게시글은 다수 비공개·가입제라 공개 확인된 것만 반영

INSERT INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  (
    'store-bang-i-oneuldo',
    '오늘도 순대',
    'sundae',
    '방이역 1번 출구. 네이버 블로그 2025-09 · 매주 금요일',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  ),
  (
    'store-samjeon-gamasot',
    '옛날가마솥순대(삼전)',
    'sundae',
    '삼전역 홈플익스 앞. 네이버 블로그·면목 후기(2026-02)에서 삼전·면목 순환 확인',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  ),
  (
    'store-nakseongdae-chicken',
    '낙성대·사당 전기한방통닭',
    'chicken',
    '낙성대·사당 다이소 앞. 네이버 블로그 후기(2024 기준 요일표, 장기 출몰)',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-magok-takoyaki',
    '마곡나루 타코야끼트럭',
    'other',
    '마곡나루 스타벅스 앞. 네이버 블로그 2025-12 · 요일 비정기',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  );

INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  ('store-bang-i-oneuldo', 37.5089, 127.1265, '서울특별시 송파구 방이동', '방이역 1번 출구 근처 뚜레쥬르 앞', '2025-09-10T00:00:00.000Z'),
  ('store-samjeon-gamasot', 37.5045, 127.0878, '서울특별시 송파구 삼전동', '삼전역 2번·홈플러스 익스프레스 삼전역점 앞', '2026-02-06T00:00:00.000Z'),
  ('store-nakseongdae-chicken', 37.4770, 126.9635, '서울특별시 관악구 봉천동', '낙성대 다이소 앞(화·목·금·토) / 사당 다이소2호점(수)', '2024-01-30T00:00:00.000Z'),
  ('store-magok-takoyaki', 37.5668, 126.8275, '서울특별시 강서구 마곡동', '마곡나루 스타벅스 앞 (비정기·주로 밤)', '2025-12-02T00:00:00.000Z');

INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('store-bang-i-oneuldo', 0, NULL, NULL, 1),
  ('store-bang-i-oneuldo', 1, NULL, NULL, 1),
  ('store-bang-i-oneuldo', 2, NULL, NULL, 1),
  ('store-bang-i-oneuldo', 3, NULL, NULL, 1),
  ('store-bang-i-oneuldo', 4, NULL, NULL, 1),
  ('store-bang-i-oneuldo', 5, '17:00', '22:00', 0),
  ('store-bang-i-oneuldo', 6, NULL, NULL, 1),

  ('store-samjeon-gamasot', 0, NULL, NULL, 1),
  ('store-samjeon-gamasot', 1, NULL, NULL, 1),
  ('store-samjeon-gamasot', 2, NULL, NULL, 1),
  ('store-samjeon-gamasot', 3, NULL, NULL, 1),
  ('store-samjeon-gamasot', 4, NULL, NULL, 1),
  ('store-samjeon-gamasot', 5, '17:00', '21:00', 0),
  ('store-samjeon-gamasot', 6, NULL, NULL, 1),

  ('store-nakseongdae-chicken', 0, NULL, NULL, 1),
  ('store-nakseongdae-chicken', 1, NULL, NULL, 1),
  ('store-nakseongdae-chicken', 2, '17:00', '22:00', 0),
  ('store-nakseongdae-chicken', 3, '17:00', '22:00', 0),
  ('store-nakseongdae-chicken', 4, '17:00', '22:00', 0),
  ('store-nakseongdae-chicken', 5, '17:00', '22:00', 0),
  ('store-nakseongdae-chicken', 6, '16:00', '22:00', 0),

  ('store-magok-takoyaki', 0, '19:00', '23:00', 0),
  ('store-magok-takoyaki', 1, '19:00', '23:00', 0),
  ('store-magok-takoyaki', 2, '19:00', '23:00', 0),
  ('store-magok-takoyaki', 3, '19:00', '23:00', 0),
  ('store-magok-takoyaki', 4, '19:00', '23:00', 0),
  ('store-magok-takoyaki', 5, '19:00', '23:00', 0),
  ('store-magok-takoyaki', 6, '19:00', '23:00', 0);

INSERT INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-bang-i-oneuldo', '찹쌀순대', 6000, 1, 1),
  ('store-bang-i-oneuldo', '모듬순대', 7000, 1, 2),
  ('store-bang-i-oneuldo', '내장', 7000, 1, 3),
  ('store-bang-i-oneuldo', '오순스페셜', 19000, 1, 4),

  ('store-samjeon-gamasot', '찰순대 소', 5000, 1, 1),
  ('store-samjeon-gamasot', '모듬순대', 7000, 1, 2),
  ('store-samjeon-gamasot', '내장', 7000, 1, 3),

  ('store-nakseongdae-chicken', '한방통닭 1마리', 9000, 1, 1),
  ('store-nakseongdae-chicken', '한방통닭 2마리', 17000, 1, 2),
  ('store-nakseongdae-chicken', '양념돼지 한 덩이', 13000, 1, 3),

  ('store-magok-takoyaki', '타코야끼 8알', 5000, 1, 1);

UPDATE store_locations
SET location_note = '상봉역 맘스터치(화·금) / 면목두산 CU(금 18~20시) · 네이버 블로그 2026-02 면목 확인',
    updated_at = '2026-02-06T00:00:00.000Z'
WHERE store_id = 'store-gamasot-sangbong';
