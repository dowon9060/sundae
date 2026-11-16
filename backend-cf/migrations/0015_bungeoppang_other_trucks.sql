-- 카테고리: bungeoppang(붕어빵) 추가. other(기타)에 호떡·곱창·회 시드.
-- SQLite CHECK 확장을 위해 stores 테이블 재생성.

PRAGMA foreign_keys = OFF;

CREATE TABLE stores_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sundae', 'chicken', 'other', 'bungeoppang')),
  description TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  business_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (business_status IN ('expected', 'confirmed_open', 'unknown')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  like_count INTEGER NOT NULL DEFAULT 0
);

INSERT INTO stores_new (
  id, name, category, description, photo_url, status, business_status, created_at, like_count
)
SELECT
  id, name, category, description, photo_url, status, business_status, created_at,
  COALESCE(like_count, 0)
FROM stores;

DROP TABLE stores;
ALTER TABLE stores_new RENAME TO stores;

CREATE INDEX IF NOT EXISTS idx_stores_category ON stores(category);

PRAGMA foreign_keys = ON;

-- ========== 붕어빵 ==========
INSERT INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  ('store-bungeo-pangyo', '판교역 붕어빵', 'bungeoppang', '판교역 근처 겨울 노점. 오늘트럭 2026-11', NULL, 'active', 'expected'),
  ('store-bungeo-nonhyeon', '논현 붕어빵', 'bungeoppang', '논현 영동시장 일대. 오늘트럭 2026-10', NULL, 'active', 'expected'),
  ('store-bungeo-hanti', '한티역 붕어빵', 'bungeoppang', '한티역·언주로 일대. 오늘트럭 2026-10', NULL, 'active', 'expected'),
  ('store-bungeo-hoehyeon', '회현역 붕어빵', 'bungeoppang', '남대문·회현역 일대. 오늘트럭 2026-11', NULL, 'active', 'expected'),
  ('store-bungeo-sindang', '신당역 붕어빵·계란빵', 'bungeoppang', '신당역 근처 겨울 노점. 오늘트럭 2026-11', NULL, 'active', 'expected'),
  ('store-bungeo-samsung', '삼성역 붕어빵·분식', 'bungeoppang', '삼성역 근처. 오늘트럭 강남 삼성 요일표', NULL, 'active', 'unknown'),
  ('store-bungeo-hwamyeong', '화명 붕어빵', 'bungeoppang', '부산 북구 화명 일대. 오늘트럭 2026-10', NULL, 'active', 'unknown');

INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  ('store-bungeo-pangyo', 37.3947, 127.1112, '경기도 성남시 분당구 판교역로', '판교역 근처. 10~3월 매일 09:00~21:00(날씨·재료 변동)', '2026-11-01T00:00:00.000Z'),
  ('store-bungeo-nonhyeon', 37.5112, 127.0216, '서울특별시 강남구 논현동', '논현·영동시장 일대. 겨울철 매일(시간 확인 중)', '2026-10-27T00:00:00.000Z'),
  ('store-bungeo-hanti', 37.4963, 127.0529, '서울특별시 강남구 대치동', '한티역 근처. 겨울철 매일 11:30~19:00. 현금·계좌', '2026-10-22T00:00:00.000Z'),
  ('store-bungeo-hoehyeon', 37.5587, 126.9784, '서울특별시 중구 회현동', '회현역·남대문시장 일대. 겨울철 매일', '2026-11-03T00:00:00.000Z'),
  ('store-bungeo-sindang', 37.5656, 127.0165, '서울특별시 중구 신당동', '신당역 근처. 겨울철 매일(시간 확인 중)', '2026-11-04T00:00:00.000Z'),
  ('store-bungeo-samsung', 37.5088, 127.0632, '서울특별시 강남구 삼성동', '삼성역 근처. 월요일 제보(시간 확인 중)', '2026-10-27T00:00:00.000Z'),
  ('store-bungeo-hwamyeong', 35.2355, 129.0138, '부산광역시 북구 화명동', '화명 일대. 화요일 등 ~23:00 제보', '2026-10-20T00:00:00.000Z');

-- ========== 호떡 (기타) ==========
INSERT INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  ('store-hotteok-kkukkuli-mangpo', '꿀꿀이호떡(망포)', 'other', '수원 망포 유명 호떡트럭(구 도깨비호떡). 겨울철', NULL, 'active', 'expected'),
  ('store-hotteok-kkukkuli-homaesil', '꿀꿀이호떡(호매실)', 'other', '수원 호매실 GS아파트·13/14단지. 주말 제보', NULL, 'active', 'expected'),
  ('store-hotteok-sindang', '신당역 왕호떡', 'other', '신당역 근처 겨울 노점. 오늘트럭 2026-10', NULL, 'active', 'expected'),
  ('store-hotteok-sindang-2', '신당역 호떡(2)', 'other', '신당역 근처 두 번째 호떡 노점. 오늘트럭', NULL, 'active', 'unknown'),
  ('store-hotteok-banpo', '호떡맨(반포한강)', 'other', '반포한강공원 달빛광장 허가 푸드트럭', NULL, 'active', 'expected');

INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  ('store-hotteok-kkukkuli-mangpo', 37.2658, 127.0575, '경기도 수원시 영통구 망포동', '망포역 8번 현대자동차·6번 출구 등. 일·월 고정 제보, 수·금 출몰. 12~3월. 현금·계좌', '2026-01-19T00:00:00.000Z'),
  ('store-hotteok-kkukkuli-homaesil', 37.2645, 126.9630, '경기도 수원시 권선구 호매실동', '호매실 GS아파트·13/14단지. 토·일 오후대(변동)', '2026-01-16T00:00:00.000Z'),
  ('store-hotteok-sindang', 37.5657, 127.0163, '서울특별시 중구 신당동', '신당역 근처. 겨울철 월~토 12:00~19:00. 왕호떡 현금', '2026-10-19T00:00:00.000Z'),
  ('store-hotteok-sindang-2', 37.5662, 127.0170, '서울특별시 중구 신당동', '신당역 근처 2. 겨울철(시간 확인 중)', '2026-07-19T00:00:00.000Z'),
  ('store-hotteok-banpo', 37.5098, 126.9953, '서울특별시 서초구 신반포로11길 40', '반포한강공원 달빛광장', '2026-05-07T00:00:00.000Z');

-- ========== 곱창 (기타) ==========
INSERT INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  ('store-gopchang-maniakim', '곱창매니아김', 'other', '성남 은행동·하대원·도촌 순환. 오늘트럭 2026-10', NULL, 'active', 'expected'),
  ('store-gopchang-mapo-honorsville', '마포 경남아너스빌 곱창', 'other', '창전로 경남아너스빌 앞. 목요일 제보(당근)', NULL, 'active', 'expected'),
  ('store-gopchang-sejong', '곱창야시장(세종대)', 'other', '세종대 학술정보원 앞 허가 푸드트럭', NULL, 'active', 'expected'),
  ('store-gopchang-seoultech', '곱창야시장(서울과기대)', 'other', '서울과기대 운동장 일대 허가 푸드트럭', NULL, 'active', 'expected');

INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  ('store-gopchang-maniakim', 37.4270, 127.1275, '경기도 성남시 중원구 은행동', '월 상원초 후문 / 화 하대원 아튼빌 / 수 은행주공 / 목 은행2동주민센터 / 금 도촌4단지 도촌마트', '2026-10-24T00:00:00.000Z'),
  ('store-gopchang-mapo-honorsville', 37.5475, 126.9295, '서울특별시 마포구 창전로2길 42', '경남아너스빌 앞. 매주 목요일 제보', '2026-11-01T00:00:00.000Z'),
  ('store-gopchang-sejong', 37.5509, 127.0737, '서울특별시 광진구 능동로 209', '세종대학교 학술정보원 앞', '2022-11-06T00:00:00.000Z'),
  ('store-gopchang-seoultech', 37.6316, 127.0774, '서울특별시 노원구 공릉로 232', '서울과학기술대학교 운동장 일대', '2022-09-24T00:00:00.000Z');

-- ========== 회 (기타) ==========
INSERT INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  ('store-hoe-pyeongtaek-segyo', '평택 세교 오징어회트럭', 'other', '세교 힐스테이트1차 앞. 금요일 제보(당근)', NULL, 'active', 'unknown'),
  ('store-hoe-pyeongtaek-godeok', '평택 고덕 회트럭', 'other', '고덕 여염리 일대 오징어·낙지회 제보', NULL, 'active', 'unknown'),
  ('store-hoe-pyeongtaek-central', '평택 센트럴자이 회트럭', 'other', '센트럴자이5단지 상가 일대 제보', NULL, 'active', 'unknown');

INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  ('store-hoe-pyeongtaek-segyo', 37.0075, 127.0720, '경기도 평택시 세교동', '힐스테이트 세교 1차 앞. 금요일 제보(변동)', '2026-11-01T00:00:00.000Z'),
  ('store-hoe-pyeongtaek-godeok', 37.0350, 127.0550, '경기도 평택시 고덕면 여염리', '여염리 4229-1 근처 제보', '2026-11-01T00:00:00.000Z'),
  ('store-hoe-pyeongtaek-central', 37.0550, 127.0480, '경기도 평택시 고덕동', '센트럴자이 5단지 상가 일대 제보', '2026-11-01T00:00:00.000Z');

-- 영업시간
INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  -- 판교·논현·한티·회현·신당 붕어빵: 겨울철 매일
  ('store-bungeo-pangyo', 0, '09:00', '21:00', 0),
  ('store-bungeo-pangyo', 1, '09:00', '21:00', 0),
  ('store-bungeo-pangyo', 2, '09:00', '21:00', 0),
  ('store-bungeo-pangyo', 3, '09:00', '21:00', 0),
  ('store-bungeo-pangyo', 4, '09:00', '21:00', 0),
  ('store-bungeo-pangyo', 5, '09:00', '21:00', 0),
  ('store-bungeo-pangyo', 6, '09:00', '21:00', 0),

  ('store-bungeo-nonhyeon', 0, '12:00', '21:00', 0),
  ('store-bungeo-nonhyeon', 1, '12:00', '21:00', 0),
  ('store-bungeo-nonhyeon', 2, '12:00', '21:00', 0),
  ('store-bungeo-nonhyeon', 3, '12:00', '21:00', 0),
  ('store-bungeo-nonhyeon', 4, '12:00', '21:00', 0),
  ('store-bungeo-nonhyeon', 5, '12:00', '21:00', 0),
  ('store-bungeo-nonhyeon', 6, '12:00', '21:00', 0),

  ('store-bungeo-hanti', 0, '11:30', '19:00', 0),
  ('store-bungeo-hanti', 1, '11:30', '19:00', 0),
  ('store-bungeo-hanti', 2, '11:30', '19:00', 0),
  ('store-bungeo-hanti', 3, '11:30', '19:00', 0),
  ('store-bungeo-hanti', 4, '11:30', '19:00', 0),
  ('store-bungeo-hanti', 5, '11:30', '19:00', 0),
  ('store-bungeo-hanti', 6, '11:30', '19:00', 0),

  ('store-bungeo-hoehyeon', 0, '12:00', '21:00', 0),
  ('store-bungeo-hoehyeon', 1, '12:00', '21:00', 0),
  ('store-bungeo-hoehyeon', 2, '12:00', '21:00', 0),
  ('store-bungeo-hoehyeon', 3, '12:00', '21:00', 0),
  ('store-bungeo-hoehyeon', 4, '12:00', '21:00', 0),
  ('store-bungeo-hoehyeon', 5, '12:00', '21:00', 0),
  ('store-bungeo-hoehyeon', 6, '12:00', '21:00', 0),

  ('store-bungeo-sindang', 0, '12:00', '21:00', 0),
  ('store-bungeo-sindang', 1, '12:00', '21:00', 0),
  ('store-bungeo-sindang', 2, '12:00', '21:00', 0),
  ('store-bungeo-sindang', 3, '12:00', '21:00', 0),
  ('store-bungeo-sindang', 4, '12:00', '21:00', 0),
  ('store-bungeo-sindang', 5, '12:00', '21:00', 0),
  ('store-bungeo-sindang', 6, '12:00', '21:00', 0),

  ('store-bungeo-samsung', 0, NULL, NULL, 1),
  ('store-bungeo-samsung', 1, '17:00', '21:00', 0),
  ('store-bungeo-samsung', 2, NULL, NULL, 1),
  ('store-bungeo-samsung', 3, NULL, NULL, 1),
  ('store-bungeo-samsung', 4, NULL, NULL, 1),
  ('store-bungeo-samsung', 5, NULL, NULL, 1),
  ('store-bungeo-samsung', 6, NULL, NULL, 1),

  ('store-bungeo-hwamyeong', 0, NULL, NULL, 1),
  ('store-bungeo-hwamyeong', 1, NULL, NULL, 1),
  ('store-bungeo-hwamyeong', 2, '17:00', '23:00', 0),
  ('store-bungeo-hwamyeong', 3, NULL, NULL, 1),
  ('store-bungeo-hwamyeong', 4, NULL, NULL, 1),
  ('store-bungeo-hwamyeong', 5, NULL, NULL, 1),
  ('store-bungeo-hwamyeong', 6, NULL, NULL, 1),

  -- 꿀꿀이 망포: 일·월 중심 + 수금 가정
  ('store-hotteok-kkukkuli-mangpo', 0, '15:00', '21:00', 0),
  ('store-hotteok-kkukkuli-mangpo', 1, '15:00', '21:00', 0),
  ('store-hotteok-kkukkuli-mangpo', 2, NULL, NULL, 1),
  ('store-hotteok-kkukkuli-mangpo', 3, '15:00', '21:00', 0),
  ('store-hotteok-kkukkuli-mangpo', 4, NULL, NULL, 1),
  ('store-hotteok-kkukkuli-mangpo', 5, '15:00', '21:00', 0),
  ('store-hotteok-kkukkuli-mangpo', 6, NULL, NULL, 1),

  ('store-hotteok-kkukkuli-homaesil', 0, '14:00', '20:00', 0),
  ('store-hotteok-kkukkuli-homaesil', 1, NULL, NULL, 1),
  ('store-hotteok-kkukkuli-homaesil', 2, NULL, NULL, 1),
  ('store-hotteok-kkukkuli-homaesil', 3, NULL, NULL, 1),
  ('store-hotteok-kkukkuli-homaesil', 4, NULL, NULL, 1),
  ('store-hotteok-kkukkuli-homaesil', 5, NULL, NULL, 1),
  ('store-hotteok-kkukkuli-homaesil', 6, '14:00', '20:00', 0),

  ('store-hotteok-sindang', 0, NULL, NULL, 1),
  ('store-hotteok-sindang', 1, '12:00', '19:00', 0),
  ('store-hotteok-sindang', 2, '12:00', '19:00', 0),
  ('store-hotteok-sindang', 3, '12:00', '19:00', 0),
  ('store-hotteok-sindang', 4, '12:00', '19:00', 0),
  ('store-hotteok-sindang', 5, '12:00', '19:00', 0),
  ('store-hotteok-sindang', 6, '12:00', '19:00', 0),

  ('store-hotteok-sindang-2', 0, '12:00', '19:00', 0),
  ('store-hotteok-sindang-2', 1, '12:00', '19:00', 0),
  ('store-hotteok-sindang-2', 2, '12:00', '19:00', 0),
  ('store-hotteok-sindang-2', 3, '12:00', '19:00', 0),
  ('store-hotteok-sindang-2', 4, '12:00', '19:00', 0),
  ('store-hotteok-sindang-2', 5, '12:00', '19:00', 0),
  ('store-hotteok-sindang-2', 6, '12:00', '19:00', 0),

  ('store-hotteok-banpo', 0, '11:00', '21:00', 0),
  ('store-hotteok-banpo', 1, '11:00', '21:00', 0),
  ('store-hotteok-banpo', 2, '11:00', '21:00', 0),
  ('store-hotteok-banpo', 3, '11:00', '21:00', 0),
  ('store-hotteok-banpo', 4, '11:00', '21:00', 0),
  ('store-hotteok-banpo', 5, '11:00', '21:00', 0),
  ('store-hotteok-banpo', 6, '11:00', '21:00', 0),

  -- 곱창매니아김 월~금
  ('store-gopchang-maniakim', 0, NULL, NULL, 1),
  ('store-gopchang-maniakim', 1, '17:00', '21:00', 0),
  ('store-gopchang-maniakim', 2, '17:00', '21:00', 0),
  ('store-gopchang-maniakim', 3, '17:00', '21:00', 0),
  ('store-gopchang-maniakim', 4, '17:00', '21:00', 0),
  ('store-gopchang-maniakim', 5, '17:00', '21:00', 0),
  ('store-gopchang-maniakim', 6, NULL, NULL, 1),

  ('store-gopchang-mapo-honorsville', 0, NULL, NULL, 1),
  ('store-gopchang-mapo-honorsville', 1, NULL, NULL, 1),
  ('store-gopchang-mapo-honorsville', 2, NULL, NULL, 1),
  ('store-gopchang-mapo-honorsville', 3, NULL, NULL, 1),
  ('store-gopchang-mapo-honorsville', 4, '17:00', '21:00', 0),
  ('store-gopchang-mapo-honorsville', 5, NULL, NULL, 1),
  ('store-gopchang-mapo-honorsville', 6, NULL, NULL, 1),

  ('store-gopchang-sejong', 0, '17:00', '23:00', 0),
  ('store-gopchang-sejong', 1, '17:00', '23:00', 0),
  ('store-gopchang-sejong', 2, '17:00', '23:00', 0),
  ('store-gopchang-sejong', 3, '17:00', '23:00', 0),
  ('store-gopchang-sejong', 4, '17:00', '23:00', 0),
  ('store-gopchang-sejong', 5, '17:00', '23:00', 0),
  ('store-gopchang-sejong', 6, '17:00', '23:00', 0),

  ('store-gopchang-seoultech', 0, '17:00', '23:00', 0),
  ('store-gopchang-seoultech', 1, '17:00', '23:00', 0),
  ('store-gopchang-seoultech', 2, '17:00', '23:00', 0),
  ('store-gopchang-seoultech', 3, '17:00', '23:00', 0),
  ('store-gopchang-seoultech', 4, '17:00', '23:00', 0),
  ('store-gopchang-seoultech', 5, '17:00', '23:00', 0),
  ('store-gopchang-seoultech', 6, '17:00', '23:00', 0),

  ('store-hoe-pyeongtaek-segyo', 0, NULL, NULL, 1),
  ('store-hoe-pyeongtaek-segyo', 1, NULL, NULL, 1),
  ('store-hoe-pyeongtaek-segyo', 2, NULL, NULL, 1),
  ('store-hoe-pyeongtaek-segyo', 3, NULL, NULL, 1),
  ('store-hoe-pyeongtaek-segyo', 4, NULL, NULL, 1),
  ('store-hoe-pyeongtaek-segyo', 5, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-segyo', 6, NULL, NULL, 1),

  ('store-hoe-pyeongtaek-godeok', 0, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-godeok', 1, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-godeok', 2, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-godeok', 3, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-godeok', 4, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-godeok', 5, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-godeok', 6, '16:00', '21:00', 0),

  ('store-hoe-pyeongtaek-central', 0, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-central', 1, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-central', 2, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-central', 3, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-central', 4, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-central', 5, '16:00', '21:00', 0),
  ('store-hoe-pyeongtaek-central', 6, '16:00', '21:00', 0);

INSERT INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-bungeo-pangyo', '붕어빵 3개', 2000, 1, 1),
  ('store-bungeo-pangyo', '어묵', 1000, 1, 2),
  ('store-bungeo-nonhyeon', '붕어빵 1개', 1000, 1, 1),
  ('store-bungeo-hanti', '붕어빵 1개', 1000, 1, 1),
  ('store-bungeo-hanti', '붕어빵 4개', 3000, 1, 2),
  ('store-bungeo-hoehyeon', '붕어빵 1개', 1000, 1, 1),
  ('store-bungeo-hoehyeon', '붕어빵 3개', 2500, 1, 2),
  ('store-bungeo-hoehyeon', '붕어빵 7개', 5000, 1, 3),
  ('store-bungeo-sindang', '붕어빵·계란빵', 1000, 1, 1),
  ('store-bungeo-samsung', '붕어빵', 1000, 1, 1),
  ('store-bungeo-hwamyeong', '붕어빵', 1000, 1, 1),

  ('store-hotteok-kkukkuli-mangpo', '호떡 1개', 1700, 1, 1),
  ('store-hotteok-kkukkuli-mangpo', '호떡 4개', 6000, 1, 2),
  ('store-hotteok-kkukkuli-mangpo', '호떡 7개', 10000, 1, 3),
  ('store-hotteok-kkukkuli-homaesil', '호떡 1개', 1700, 1, 1),
  ('store-hotteok-kkukkuli-homaesil', '호떡 4개', 6000, 1, 2),
  ('store-hotteok-kkukkuli-homaesil', '호떡 7개', 10000, 1, 3),
  ('store-hotteok-sindang', '왕호떡 1개', 2000, 1, 1),
  ('store-hotteok-sindang-2', '왕호떡(꿀) 1개', 1000, 1, 1),
  ('store-hotteok-banpo', '호떡', 2000, 1, 1),

  ('store-gopchang-maniakim', '곱창·순대·야채볶음(소)', 11000, 1, 1),
  ('store-gopchang-maniakim', '곱창·순대·야채볶음(중)', 18000, 1, 2),
  ('store-gopchang-maniakim', '곱창·순대·야채볶음(대)', 25000, 1, 3),
  ('store-gopchang-mapo-honorsville', '곱창', 15000, 1, 1),
  ('store-gopchang-sejong', '곱창', 12000, 1, 1),
  ('store-gopchang-seoultech', '곱창', 12000, 1, 1),

  ('store-hoe-pyeongtaek-segyo', '오징어회', 15000, 1, 1),
  ('store-hoe-pyeongtaek-godeok', '오징어·낙지회', 15000, 1, 1),
  ('store-hoe-pyeongtaek-central', '오징어회', 15000, 1, 1);
