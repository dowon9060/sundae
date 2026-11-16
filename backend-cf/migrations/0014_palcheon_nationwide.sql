-- 팔천순대 전국 제보 (네이버 블로그·카페 2026-10~11)
-- 고정점·요일별 이동 트럭 혼재. 위치·요일은 제보 시점 기준이며 현장 확인 권장.

INSERT INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  (
    'store-songtan-palcheon',
    '송탄 팔천순대',
    'sundae',
    '평택 송탄 뜨란채·이충동 일대 출몰 제보. 네이버 카페 ram1207',
    NULL,
    'active',
    'unknown'
  ),
  (
    'store-cheongju-palcheon',
    '청주 팔천순대',
    'sundae',
    '청주 금천·분평 요일별 순환. 네이버 블로그 맛돌희 2026-11',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-daejeon-doma-palcheon',
    '대전 도마 팔천순대',
    'sundae',
    '도마시장 e편한세상 앞. 매주 목요일. 네이버 블로그 빵쏘 2026-11',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-uijeongbu-palcheon',
    '의정부 팔천순대',
    'sundae',
    '목 의정부역 1번 출구 / 화 가능동 SK아파트. 네이버 블로그 햄찡 2026-11',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-daegu-sinmae-palcheon',
    '대구 신매·시지 팔천순대',
    'sundae',
    '수성구 매호·신매(시지) 일대 출몰. 네이버 블로그 2026-11',
    NULL,
    'active',
    'unknown'
  ),
  (
    'store-daejeon-sinseong-palcheon',
    '대전 신성 팔천순대',
    'sundae',
    '유성구 신성동 대림두레아파트 상가(가정로 65). 고정점',
    NULL,
    'active',
    'confirmed_open'
  ),
  (
    'store-jeonju-samcheon-palcheon',
    '전주 삼천 팔천순대',
    'sundae',
    '삼천동 신일강변·삼천하이츠 사이(보드람치킨 맞은편). 수·토. 네이버 블로그 2026-11',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-incheon-nonhyeon-palcheon',
    '인천 논현 팔천순대',
    'sundae',
    '남동구 논현동 고정점. 네이버 블로그 김깨비 2026-11',
    NULL,
    'active',
    'confirmed_open'
  ),
  (
    'store-jeju-palcheon',
    '제주 팔천순대',
    'sundae',
    '제주시·서귀포 요일별 순환(일 휴무). 네이버 블로그 가가멜아재·팽이 2026-10~11',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-ansan-choji-palcheon',
    '안산 초지 팔천순대',
    'sundae',
    '안산 초지점 고정점(배달·현장). 네이버 블로그 짠혜 2026-11',
    NULL,
    'active',
    'confirmed_open'
  ),
  (
    'store-daegu-central-xi-palcheon',
    '대구역 센트럴자이 팔천순대',
    'sundae',
    'GS더프레시 대구역풍경채점 앞. 매주 토요일. 네이버 블로그 2026-10',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-pohang-idong-palcheon',
    '포항 이동 팔천순대',
    'sundae',
    '이동그린빌명품아파트 앞. 매주 수요일. 네이버 블로그 꾸요미 2026-10',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-giheung-palcheon',
    '기흥역 팔천순대',
    'sundae',
    '기흥역 GS프레시마켓 앞. 매주 금요일. 네이버 블로그 다뿡이 2026-10',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-osan-palcheon',
    '오산 팔천순대',
    'sundae',
    '원동·운암 등 요일별 순환. 네이버 블로그 미니C 2026-10',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-gwanggyo-palcheon',
    '광교역 팔천순대',
    'sundae',
    '광교역(경기대) 1번 출구 인근. 월요일 제보. 네이버 블로그 아츄 2026-10',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-gwangju-unam-palcheon',
    '광주 운암 팔천순대',
    'sundae',
    '북구 운암동 초록마을 앞. 매주 목요일 15:30~22:30. 네이버 블로그 2026-10',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-suwon-kwonseon-palcheon',
    '수원 권선 팔천순대',
    'sundae',
    '권선자이 정문. 매주 화요일. 네이버 블로그 수정짱 2026-11',
    NULL,
    'active',
    'expected'
  ),
  (
    'store-chuncheon-hakgok-palcheon',
    '춘천 학곡 팔천순대',
    'sundae',
    '학곡지구 공터 출몰 제보. 네이버 블로그 감자네 2026-10',
    NULL,
    'active',
    'unknown'
  );

INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  (
    'store-songtan-palcheon',
    37.0605,
    127.0684,
    '경기도 평택시 이충동',
    '송탄 뜨란채 인근·이충동 일대(화 이충부영3차·지산 건영, 금 이충현대 등 제보). 요일 변동',
    '2026-11-16T00:00:00.000Z'
  ),
  (
    'store-cheongju-palcheon',
    36.6100,
    127.4929,
    '충청북도 청주시 서원구 1순환로1137번길 83',
    '월 방서 호반101 / 화·토 용담 GS슈퍼·동화약국 / 수 분평5단지 A마트 / 목 금천부영9단지 / 금 주은아파트(17~19:40)·분평3단지(20시~). 금천·분평 010-5171-8006',
    '2026-11-15T00:00:00.000Z'
  ),
  (
    'store-daejeon-doma-palcheon',
    36.3278,
    127.3785,
    '대전광역시 중구 도마동',
    '도마시장 e편한세상 아파트 앞. 매주 목요일',
    '2026-11-15T00:00:00.000Z'
  ),
  (
    'store-uijeongbu-palcheon',
    37.7387,
    127.0459,
    '경기도 의정부시 의정부동',
    '목 의정부역 1번 출구 근처 / 화 가능동 SK아파트 1·2단지 근처',
    '2026-11-14T00:00:00.000Z'
  ),
  (
    'store-daegu-sinmae-palcheon',
    35.8507,
    128.7084,
    '대구광역시 수성구 매호동',
    '시지·신매·매호동 일대. 정확한 요일·핀은 현장·SNS 확인',
    '2026-11-13T00:00:00.000Z'
  ),
  (
    'store-daejeon-sinseong-palcheon',
    36.3868,
    127.3508,
    '대전광역시 유성구 가정로 65',
    '대림두레아파트 상가 1-126호. 16:00~22:30(변동 가능)',
    '2026-11-16T00:00:00.000Z'
  ),
  (
    'store-jeonju-samcheon-palcheon',
    35.8098,
    127.1125,
    '전북특별자치도 전주시 완산구 강변로 98-1',
    '신일강변아파트·삼천하이츠 사이, 보드람치킨 맞은편. 매주 수·토',
    '2026-11-14T00:00:00.000Z'
  ),
  (
    'store-incheon-nonhyeon-palcheon',
    37.4019,
    126.7224,
    '인천광역시 남동구 논고개로123번길 54',
    '1층 101호. 13:00~23:00 / 연중무휴(제보). 0507-1478-4246',
    '2026-11-13T00:00:00.000Z'
  ),
  (
    'store-jeju-palcheon',
    33.2620,
    126.4289,
    '제주특별자치도 서귀포시 중문동',
    '월 광령 / 화 외도 / 수 서귀포·모슬포 홍마트 제보 / 목 중문(한화포레나→우체국) / 금 화북 / 토 한림 / 일 휴무. 보통 17~21·23시, 솔드아웃 시 종료',
    '2026-11-13T00:00:00.000Z'
  ),
  (
    'store-ansan-choji-palcheon',
    37.3135,
    126.8115,
    '경기도 안산시 단원구 초지동',
    '안산 초지점. 현장·배달(쿠팡이츠 등) 제보',
    '2026-11-10T00:00:00.000Z'
  ),
  (
    'store-daegu-central-xi-palcheon',
    35.8760,
    128.5961,
    '대구광역시 중구 태평로 인근',
    'GS더프레시 대구역풍경채점 앞. 매주 토요일. 대구역센트럴자이·제일풍경채 인근',
    '2026-10-20T00:00:00.000Z'
  ),
  (
    'store-pohang-idong-palcheon',
    36.0297,
    129.3340,
    '경상북도 포항시 남구 이동',
    '이동그린빌명품아파트 앞. 매주 수요일',
    '2026-10-21T00:00:00.000Z'
  ),
  (
    'store-giheung-palcheon',
    37.2760,
    127.1167,
    '경기도 용인시 기흥구 구갈동',
    '기흥역 GS프레시마켓 앞. 매주 금요일(푸르지오 육교 쪽 제보도 있음)',
    '2026-10-24T00:00:00.000Z'
  ),
  (
    'store-osan-palcheon',
    37.1412,
    127.0740,
    '경기도 오산시 원동',
    '월 원동푸르지오(16~21)·운암1단지(21~23) / 화 청호휴먼시아·원동이마트 / 수 재일하이빌 / 목 원동푸르지오 / 금 원동이마트 / 토 운암1단지. 공휴일 휴무. 010-3119-5912',
    '2026-10-23T00:00:00.000Z'
  ),
  (
    'store-gwanggyo-palcheon',
    37.3021,
    127.0443,
    '경기도 수원시 영통구 이의동',
    '광교역 1번 출구 근처(월요일 제보). 화 광교중앙역·우만초 사거리 등 제보. 보통 ~23시, 카드 불가',
    '2026-10-27T00:00:00.000Z'
  ),
  (
    'store-gwangju-unam-palcheon',
    35.1760,
    126.8746,
    '광주광역시 북구 서강로54번길 35',
    '운암동 초록마을 앞. 매주 목요일 15:30~22:30(변동 가능)',
    '2026-10-23T00:00:00.000Z'
  ),
  (
    'store-suwon-kwonseon-palcheon',
    37.2533,
    127.0265,
    '경기도 수원시 권선구 권선동',
    '권선자이 정문. 매주 화요일. 현금·계좌이체',
    '2026-11-09T00:00:00.000Z'
  ),
  (
    'store-chuncheon-hakgok-palcheon',
    37.8810,
    127.7480,
    '강원특별자치도 춘천시 동면 학곡리',
    '학곡지구 공터. 비정기 출몰 제보',
    '2026-10-24T00:00:00.000Z'
  );

-- 공통 영업시간: 알려진 요일만 open, 나머지 closed
INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  -- 송탄: 불명확 → 저녁대 가정(월~토)
  ('store-songtan-palcheon', 0, NULL, NULL, 1),
  ('store-songtan-palcheon', 1, '17:00', '22:00', 0),
  ('store-songtan-palcheon', 2, '17:00', '22:00', 0),
  ('store-songtan-palcheon', 3, '17:00', '22:00', 0),
  ('store-songtan-palcheon', 4, '17:00', '22:00', 0),
  ('store-songtan-palcheon', 5, '17:00', '22:00', 0),
  ('store-songtan-palcheon', 6, '17:00', '22:00', 0),

  -- 청주 금천·분평: 월~토
  ('store-cheongju-palcheon', 0, NULL, NULL, 1),
  ('store-cheongju-palcheon', 1, '17:00', '21:00', 0),
  ('store-cheongju-palcheon', 2, '17:00', '21:00', 0),
  ('store-cheongju-palcheon', 3, '17:00', '21:00', 0),
  ('store-cheongju-palcheon', 4, '17:00', '21:00', 0),
  ('store-cheongju-palcheon', 5, '17:00', '22:00', 0),
  ('store-cheongju-palcheon', 6, '17:00', '21:00', 0),

  -- 대전 도마: 목
  ('store-daejeon-doma-palcheon', 0, NULL, NULL, 1),
  ('store-daejeon-doma-palcheon', 1, NULL, NULL, 1),
  ('store-daejeon-doma-palcheon', 2, NULL, NULL, 1),
  ('store-daejeon-doma-palcheon', 3, NULL, NULL, 1),
  ('store-daejeon-doma-palcheon', 4, '17:00', '21:00', 0),
  ('store-daejeon-doma-palcheon', 5, NULL, NULL, 1),
  ('store-daejeon-doma-palcheon', 6, NULL, NULL, 1),

  -- 의정부: 화·목
  ('store-uijeongbu-palcheon', 0, NULL, NULL, 1),
  ('store-uijeongbu-palcheon', 1, NULL, NULL, 1),
  ('store-uijeongbu-palcheon', 2, '17:00', '21:00', 0),
  ('store-uijeongbu-palcheon', 3, NULL, NULL, 1),
  ('store-uijeongbu-palcheon', 4, '17:00', '21:00', 0),
  ('store-uijeongbu-palcheon', 5, NULL, NULL, 1),
  ('store-uijeongbu-palcheon', 6, NULL, NULL, 1),

  -- 대구 신매: 불명확
  ('store-daegu-sinmae-palcheon', 0, NULL, NULL, 1),
  ('store-daegu-sinmae-palcheon', 1, '17:00', '21:00', 0),
  ('store-daegu-sinmae-palcheon', 2, '17:00', '21:00', 0),
  ('store-daegu-sinmae-palcheon', 3, '17:00', '21:00', 0),
  ('store-daegu-sinmae-palcheon', 4, '17:00', '21:00', 0),
  ('store-daegu-sinmae-palcheon', 5, '17:00', '21:00', 0),
  ('store-daegu-sinmae-palcheon', 6, '17:00', '21:00', 0),

  -- 대전 신성 고정
  ('store-daejeon-sinseong-palcheon', 0, '16:00', '22:30', 0),
  ('store-daejeon-sinseong-palcheon', 1, '16:00', '22:30', 0),
  ('store-daejeon-sinseong-palcheon', 2, '16:00', '22:30', 0),
  ('store-daejeon-sinseong-palcheon', 3, '16:00', '22:30', 0),
  ('store-daejeon-sinseong-palcheon', 4, '16:00', '22:30', 0),
  ('store-daejeon-sinseong-palcheon', 5, '16:00', '22:30', 0),
  ('store-daejeon-sinseong-palcheon', 6, '16:00', '22:30', 0),

  -- 전주 삼천: 수·토
  ('store-jeonju-samcheon-palcheon', 0, NULL, NULL, 1),
  ('store-jeonju-samcheon-palcheon', 1, NULL, NULL, 1),
  ('store-jeonju-samcheon-palcheon', 2, NULL, NULL, 1),
  ('store-jeonju-samcheon-palcheon', 3, '17:00', '21:00', 0),
  ('store-jeonju-samcheon-palcheon', 4, NULL, NULL, 1),
  ('store-jeonju-samcheon-palcheon', 5, NULL, NULL, 1),
  ('store-jeonju-samcheon-palcheon', 6, '17:00', '21:00', 0),

  -- 인천 논현 고정
  ('store-incheon-nonhyeon-palcheon', 0, '13:00', '23:00', 0),
  ('store-incheon-nonhyeon-palcheon', 1, '13:00', '23:00', 0),
  ('store-incheon-nonhyeon-palcheon', 2, '13:00', '23:00', 0),
  ('store-incheon-nonhyeon-palcheon', 3, '13:00', '23:00', 0),
  ('store-incheon-nonhyeon-palcheon', 4, '13:00', '23:00', 0),
  ('store-incheon-nonhyeon-palcheon', 5, '13:00', '23:00', 0),
  ('store-incheon-nonhyeon-palcheon', 6, '13:00', '23:00', 0),

  -- 제주: 일 휴무
  ('store-jeju-palcheon', 0, NULL, NULL, 1),
  ('store-jeju-palcheon', 1, '17:00', '23:00', 0),
  ('store-jeju-palcheon', 2, '17:00', '23:00', 0),
  ('store-jeju-palcheon', 3, '16:00', '22:00', 0),
  ('store-jeju-palcheon', 4, '17:00', '23:00', 0),
  ('store-jeju-palcheon', 5, '17:00', '23:00', 0),
  ('store-jeju-palcheon', 6, '17:00', '23:00', 0),

  -- 안산 초지
  ('store-ansan-choji-palcheon', 0, '11:00', '22:00', 0),
  ('store-ansan-choji-palcheon', 1, '11:00', '22:00', 0),
  ('store-ansan-choji-palcheon', 2, '11:00', '22:00', 0),
  ('store-ansan-choji-palcheon', 3, '11:00', '22:00', 0),
  ('store-ansan-choji-palcheon', 4, '11:00', '22:00', 0),
  ('store-ansan-choji-palcheon', 5, '11:00', '22:00', 0),
  ('store-ansan-choji-palcheon', 6, '11:00', '22:00', 0),

  -- 대구역 센트럴자이: 토
  ('store-daegu-central-xi-palcheon', 0, NULL, NULL, 1),
  ('store-daegu-central-xi-palcheon', 1, NULL, NULL, 1),
  ('store-daegu-central-xi-palcheon', 2, NULL, NULL, 1),
  ('store-daegu-central-xi-palcheon', 3, NULL, NULL, 1),
  ('store-daegu-central-xi-palcheon', 4, NULL, NULL, 1),
  ('store-daegu-central-xi-palcheon', 5, NULL, NULL, 1),
  ('store-daegu-central-xi-palcheon', 6, '16:00', '21:00', 0),

  -- 포항 이동: 수
  ('store-pohang-idong-palcheon', 0, NULL, NULL, 1),
  ('store-pohang-idong-palcheon', 1, NULL, NULL, 1),
  ('store-pohang-idong-palcheon', 2, NULL, NULL, 1),
  ('store-pohang-idong-palcheon', 3, '16:00', '21:00', 0),
  ('store-pohang-idong-palcheon', 4, NULL, NULL, 1),
  ('store-pohang-idong-palcheon', 5, NULL, NULL, 1),
  ('store-pohang-idong-palcheon', 6, NULL, NULL, 1),

  -- 기흥: 금
  ('store-giheung-palcheon', 0, NULL, NULL, 1),
  ('store-giheung-palcheon', 1, NULL, NULL, 1),
  ('store-giheung-palcheon', 2, NULL, NULL, 1),
  ('store-giheung-palcheon', 3, NULL, NULL, 1),
  ('store-giheung-palcheon', 4, NULL, NULL, 1),
  ('store-giheung-palcheon', 5, '17:00', '22:00', 0),
  ('store-giheung-palcheon', 6, NULL, NULL, 1),

  -- 오산: 월~토 16~23
  ('store-osan-palcheon', 0, NULL, NULL, 1),
  ('store-osan-palcheon', 1, '16:00', '23:00', 0),
  ('store-osan-palcheon', 2, '16:00', '23:00', 0),
  ('store-osan-palcheon', 3, '16:00', '23:00', 0),
  ('store-osan-palcheon', 4, '16:00', '23:00', 0),
  ('store-osan-palcheon', 5, '16:00', '23:00', 0),
  ('store-osan-palcheon', 6, '16:00', '23:00', 0),

  -- 광교: 월(제보) + 저녁대
  ('store-gwanggyo-palcheon', 0, NULL, NULL, 1),
  ('store-gwanggyo-palcheon', 1, '17:00', '23:00', 0),
  ('store-gwanggyo-palcheon', 2, '17:00', '23:00', 0),
  ('store-gwanggyo-palcheon', 3, '17:00', '23:00', 0),
  ('store-gwanggyo-palcheon', 4, '17:00', '23:00', 0),
  ('store-gwanggyo-palcheon', 5, '17:00', '23:00', 0),
  ('store-gwanggyo-palcheon', 6, '17:00', '23:00', 0),

  -- 광주 운암: 목
  ('store-gwangju-unam-palcheon', 0, NULL, NULL, 1),
  ('store-gwangju-unam-palcheon', 1, NULL, NULL, 1),
  ('store-gwangju-unam-palcheon', 2, NULL, NULL, 1),
  ('store-gwangju-unam-palcheon', 3, NULL, NULL, 1),
  ('store-gwangju-unam-palcheon', 4, '15:30', '22:30', 0),
  ('store-gwangju-unam-palcheon', 5, NULL, NULL, 1),
  ('store-gwangju-unam-palcheon', 6, NULL, NULL, 1),

  -- 수원 권선: 화
  ('store-suwon-kwonseon-palcheon', 0, NULL, NULL, 1),
  ('store-suwon-kwonseon-palcheon', 1, NULL, NULL, 1),
  ('store-suwon-kwonseon-palcheon', 2, '17:00', '21:00', 0),
  ('store-suwon-kwonseon-palcheon', 3, NULL, NULL, 1),
  ('store-suwon-kwonseon-palcheon', 4, NULL, NULL, 1),
  ('store-suwon-kwonseon-palcheon', 5, NULL, NULL, 1),
  ('store-suwon-kwonseon-palcheon', 6, NULL, NULL, 1),

  -- 춘천 학곡: 비정기 → 저녁대 가정
  ('store-chuncheon-hakgok-palcheon', 0, NULL, NULL, 1),
  ('store-chuncheon-hakgok-palcheon', 1, '17:00', '21:00', 0),
  ('store-chuncheon-hakgok-palcheon', 2, '17:00', '21:00', 0),
  ('store-chuncheon-hakgok-palcheon', 3, '17:00', '21:00', 0),
  ('store-chuncheon-hakgok-palcheon', 4, '17:00', '21:00', 0),
  ('store-chuncheon-hakgok-palcheon', 5, '17:00', '21:00', 0),
  ('store-chuncheon-hakgok-palcheon', 6, '17:00', '21:00', 0);

INSERT INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-songtan-palcheon', '찰순대', 5000, 1, 1),
  ('store-songtan-palcheon', '모듬순대(소)', 8000, 1, 2),
  ('store-songtan-palcheon', '모듬순대(대)', 12000, 1, 3),

  ('store-cheongju-palcheon', '찰순대', 5000, 1, 1),
  ('store-cheongju-palcheon', '야채·고기·김치·카레순대', 7000, 1, 2),
  ('store-cheongju-palcheon', '모듬순대(소)', 8000, 1, 3),
  ('store-cheongju-palcheon', '모듬순대(대)', 12000, 1, 4),

  ('store-daejeon-doma-palcheon', '찰순대', 5000, 1, 1),
  ('store-daejeon-doma-palcheon', '모듬순대(소)', 8000, 1, 2),
  ('store-daejeon-doma-palcheon', '모듬순대(대)', 12000, 1, 3),

  ('store-uijeongbu-palcheon', '찰순대', 5000, 1, 1),
  ('store-uijeongbu-palcheon', '모듬순대(소)', 8000, 1, 2),
  ('store-uijeongbu-palcheon', '모듬순대(중)', 10000, 1, 3),
  ('store-uijeongbu-palcheon', '모듬순대(대)', 12000, 1, 4),
  ('store-uijeongbu-palcheon', '족발(앞다리)', 19000, 1, 5),

  ('store-daegu-sinmae-palcheon', '찰순대', 5000, 1, 1),
  ('store-daegu-sinmae-palcheon', '모듬순대', 8000, 1, 2),

  ('store-daejeon-sinseong-palcheon', '찰순대', 5000, 1, 1),
  ('store-daejeon-sinseong-palcheon', '모듬순대(중)', 8000, 1, 2),
  ('store-daejeon-sinseong-palcheon', '모듬순대(대)', 12000, 1, 3),

  ('store-jeonju-samcheon-palcheon', '모듬순대(소)', 9000, 1, 1),
  ('store-jeonju-samcheon-palcheon', '모듬순대(대)', 12000, 1, 2),

  ('store-incheon-nonhyeon-palcheon', '찰순대', 5000, 1, 1),
  ('store-incheon-nonhyeon-palcheon', '모듬순대', 8000, 1, 2),

  ('store-jeju-palcheon', '모듬순대(중)', 11000, 1, 1),
  ('store-jeju-palcheon', '모듬순대(대)', 14000, 1, 2),
  ('store-jeju-palcheon', '미니족발', 14000, 1, 3),

  ('store-ansan-choji-palcheon', '찰순대(소)+내장', 24000, 1, 1),
  ('store-ansan-choji-palcheon', '찰순대', 8000, 1, 2),

  ('store-daegu-central-xi-palcheon', '모듬순대(소)', 8000, 1, 1),

  ('store-pohang-idong-palcheon', '모듬순대(중)', 10000, 1, 1),

  ('store-giheung-palcheon', '찰순대', 5000, 1, 1),
  ('store-giheung-palcheon', '야채·고기·김치·카레·왕순대', 7000, 1, 2),
  ('store-giheung-palcheon', '모듬순대', 8000, 1, 3),

  ('store-osan-palcheon', '모듬순대(소)', 10000, 1, 1),
  ('store-osan-palcheon', '찰순대', 5000, 1, 2),

  ('store-gwanggyo-palcheon', '찰순대', 6000, 1, 1),
  ('store-gwanggyo-palcheon', '모듬순대(소)', 10000, 1, 2),
  ('store-gwanggyo-palcheon', '모듬순대(대)', 15000, 1, 3),

  ('store-gwangju-unam-palcheon', '찰순대', 6000, 1, 1),
  ('store-gwangju-unam-palcheon', '모듬순대', 8000, 1, 2),

  ('store-suwon-kwonseon-palcheon', '모듬순대(소)', 10000, 1, 1),

  ('store-chuncheon-hakgok-palcheon', '모듬순대(소)', 9000, 1, 1),
  ('store-chuncheon-hakgok-palcheon', '미니족발', 14000, 1, 2);
