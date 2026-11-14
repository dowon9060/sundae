-- 온라인 재수집분 (오늘트럭·당근·네이버 블로그)
-- 서울만. 이미 있는 트럭과 중복되지 않는 항목

INSERT INTO stores (id, name, category, description, photo_url, status, business_status) VALUES
  (
    'store-oneulsundae-mangu',
    '오늘은순대(망우·상봉)',
    'sundae',
    '망우역 인근. 오늘트럭 메뉴 확인 2026-07-18',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  ),
  (
    'store-oneulsundae-gangdong',
    '오늘은순대(강동)',
    'sundae',
    '강동 순환. 당근 동네생활 요일 제보 (월 암사·화 성내·목 천호 등)',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-happy-sundae-mokdong',
    '햅삐순대',
    'sundae',
    '목동사거리 홍익병원 교통섬. 당근 제보 · 목 17시~ / 수요일 언급도 있음',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-seokchon-sundae',
    '석촌고분 순대트럭',
    'sundae',
    '석촌고분역 4번 이마트24 앞. 당근 동네생활 · 토요일',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-hwagok-sundae',
    '화곡 볏골공원 순대트럭',
    'sundae',
    '화곡본동시장 볏골공원 앞. 당근 · 금 17~18시쯤',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-seokgye-chicken',
    '석계역 전기구이통닭',
    'chicken',
    '석계역 인근. 당근 · 주로 토요일 · 날씨 영향',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-gudi-takoyaki',
    '구디역 타코야끼트럭',
    'other',
    '구로디지털단지역 4번·자이아파트 앞. 당근 · 주로 화요일(금 출몰 제보도)',
    'https://images.pexels.com/photos/20122289/pexels-photo-20122289.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'unknown'
  ),
  (
    'store-myongji-takoyaki',
    '명지대 앞 타코야끼트럭',
    'other',
    '명지대 앞(남가좌). 당근 · 화·목 21~23시 · 우천·한여름 휴무',
    'https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'active',
    'expected'
  );

INSERT INTO store_locations (store_id, lat, lng, address, location_note, updated_at) VALUES
  ('store-oneulsundae-mangu', 37.5991, 127.0918, '서울특별시 중랑구 망우동', '망우역 근처', '2026-07-18T00:00:00.000Z'),
  ('store-oneulsundae-gangdong', 37.5500, 127.1275, '서울특별시 강동구 암사동', '월 암사역2번·화 성내 삼성아파트·목 천호 네스빌·금 동성교회·토 천일초 등', '2026-01-01T00:00:00.000Z'),
  ('store-happy-sundae-mokdong', 37.5320, 126.8635, '서울특별시 양천구 목동', '목동사거리 홍익병원쪽 횡단보도 교통섬', '2026-01-01T00:00:00.000Z'),
  ('store-seokchon-sundae', 37.5024, 127.1030, '서울특별시 송파구 석촌동', '석촌고분역 4번 출구 이마트24 앞', '2026-01-01T00:00:00.000Z'),
  ('store-hwagok-sundae', 37.5415, 126.8405, '서울특별시 강서구 화곡동', '화곡본동시장 볏골공원 앞', '2026-01-01T00:00:00.000Z'),
  ('store-seokgye-chicken', 37.6150, 127.0657, '서울특별시 노원구 월계동', '석계역 인근', '2026-01-01T00:00:00.000Z'),
  ('store-gudi-takoyaki', 37.4853, 126.9015, '서울특별시 구로구 구로동', '구로디지털단지역 4번 출구 · 자이아파트 앞', '2026-01-01T00:00:00.000Z'),
  ('store-myongji-takoyaki', 37.5805, 126.9230, '서울특별시 서대문구 남가좌동', '명지대학교 앞', '2026-01-01T00:00:00.000Z');

INSERT INTO business_hours (store_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('store-oneulsundae-mangu', 0, NULL, NULL, 1),
  ('store-oneulsundae-mangu', 1, NULL, NULL, 1),
  ('store-oneulsundae-mangu', 2, '17:00', '22:00', 0),
  ('store-oneulsundae-mangu', 3, NULL, NULL, 1),
  ('store-oneulsundae-mangu', 4, NULL, NULL, 1),
  ('store-oneulsundae-mangu', 5, NULL, NULL, 1),
  ('store-oneulsundae-mangu', 6, NULL, NULL, 1),

  ('store-oneulsundae-gangdong', 0, NULL, NULL, 1),
  ('store-oneulsundae-gangdong', 1, '17:00', '22:00', 0),
  ('store-oneulsundae-gangdong', 2, '17:00', '22:00', 0),
  ('store-oneulsundae-gangdong', 3, NULL, NULL, 1),
  ('store-oneulsundae-gangdong', 4, '17:00', '22:00', 0),
  ('store-oneulsundae-gangdong', 5, '17:00', '22:00', 0),
  ('store-oneulsundae-gangdong', 6, '17:00', '22:00', 0),

  ('store-happy-sundae-mokdong', 0, NULL, NULL, 1),
  ('store-happy-sundae-mokdong', 1, NULL, NULL, 1),
  ('store-happy-sundae-mokdong', 2, NULL, NULL, 1),
  ('store-happy-sundae-mokdong', 3, '17:00', '23:00', 0),
  ('store-happy-sundae-mokdong', 4, '17:00', '23:00', 0),
  ('store-happy-sundae-mokdong', 5, NULL, NULL, 1),
  ('store-happy-sundae-mokdong', 6, NULL, NULL, 1),

  ('store-seokchon-sundae', 0, NULL, NULL, 1),
  ('store-seokchon-sundae', 1, NULL, NULL, 1),
  ('store-seokchon-sundae', 2, NULL, NULL, 1),
  ('store-seokchon-sundae', 3, NULL, NULL, 1),
  ('store-seokchon-sundae', 4, NULL, NULL, 1),
  ('store-seokchon-sundae', 5, NULL, NULL, 1),
  ('store-seokchon-sundae', 6, '17:00', '22:00', 0),

  ('store-hwagok-sundae', 0, NULL, NULL, 1),
  ('store-hwagok-sundae', 1, NULL, NULL, 1),
  ('store-hwagok-sundae', 2, NULL, NULL, 1),
  ('store-hwagok-sundae', 3, NULL, NULL, 1),
  ('store-hwagok-sundae', 4, NULL, NULL, 1),
  ('store-hwagok-sundae', 5, '17:00', '21:00', 0),
  ('store-hwagok-sundae', 6, NULL, NULL, 1),

  ('store-seokgye-chicken', 0, NULL, NULL, 1),
  ('store-seokgye-chicken', 1, NULL, NULL, 1),
  ('store-seokgye-chicken', 2, NULL, NULL, 1),
  ('store-seokgye-chicken', 3, NULL, NULL, 1),
  ('store-seokgye-chicken', 4, NULL, NULL, 1),
  ('store-seokgye-chicken', 5, NULL, NULL, 1),
  ('store-seokgye-chicken', 6, '16:00', '22:00', 0),

  ('store-gudi-takoyaki', 0, NULL, NULL, 1),
  ('store-gudi-takoyaki', 1, NULL, NULL, 1),
  ('store-gudi-takoyaki', 2, '18:00', '23:00', 0),
  ('store-gudi-takoyaki', 3, NULL, NULL, 1),
  ('store-gudi-takoyaki', 4, NULL, NULL, 1),
  ('store-gudi-takoyaki', 5, '18:00', '23:00', 0),
  ('store-gudi-takoyaki', 6, NULL, NULL, 1),

  ('store-myongji-takoyaki', 0, NULL, NULL, 1),
  ('store-myongji-takoyaki', 1, NULL, NULL, 1),
  ('store-myongji-takoyaki', 2, '21:00', '23:00', 0),
  ('store-myongji-takoyaki', 3, NULL, NULL, 1),
  ('store-myongji-takoyaki', 4, '21:00', '23:00', 0),
  ('store-myongji-takoyaki', 5, NULL, NULL, 1),
  ('store-myongji-takoyaki', 6, NULL, NULL, 1);

INSERT INTO menus (store_id, name, price, is_available, sort_order) VALUES
  ('store-oneulsundae-mangu', '찹쌀순대', 6000, 1, 1),
  ('store-oneulsundae-mangu', '모듬순대', 7000, 1, 2),
  ('store-oneulsundae-mangu', '토종순대', 9000, 1, 3),
  ('store-oneulsundae-mangu', '내장모듬', 7000, 1, 4),

  ('store-oneulsundae-gangdong', '찹쌀순대', 6000, 1, 1),
  ('store-oneulsundae-gangdong', '모듬순대', 7000, 1, 2),
  ('store-oneulsundae-gangdong', '내장', 7000, 1, 3),

  ('store-happy-sundae-mokdong', '모듬순대 소', 7000, 1, 1),
  ('store-happy-sundae-mokdong', '찰순대', 6000, 1, 2),

  ('store-seokchon-sundae', '모듬순대', 7000, 1, 1),
  ('store-seokchon-sundae', '내장', 7000, 1, 2),

  ('store-hwagok-sundae', '모듬순대', 7000, 1, 1),
  ('store-hwagok-sundae', '찰순대', 6000, 1, 2),

  ('store-seokgye-chicken', '통닭 1마리', 10000, 1, 1),
  ('store-seokgye-chicken', '통닭 2마리', 18000, 1, 2),

  ('store-gudi-takoyaki', '타코야끼', 5000, 1, 1),

  ('store-myongji-takoyaki', '타코야끼', 5000, 1, 1);

-- 기존 트럭 메모 보강
UPDATE store_locations
SET location_note = '위례 31단지(일)·23단지 CU(수·금 15:30~20:00) · 당근에도 목 31단지 정문 제보',
    updated_at = '2026-07-03T00:00:00.000Z'
WHERE store_id = 'store-wirye-sundae';

UPDATE store_locations
SET location_note = '염창 대림아파트·포미즈병원 앞 등 · 당근 염창역 사잇길 제보',
    updated_at = '2026-09-02T00:00:00.000Z'
WHERE store_id = 'store-yeomchang-sundae';
