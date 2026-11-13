/** MVP용 정적 주소/역 검색 후보. 추후 외부 geocoding으로 교체 가능 */
const LOCATION_CANDIDATES = [
  {
    id: 'loc-yeoksam',
    name: '역삼동',
    address: '서울특별시 강남구 역삼동',
    lat: 37.5007,
    lng: 127.0365,
    type: 'neighborhood' as const,
  },
  {
    id: 'loc-yeoksam-st',
    name: '역삼역',
    address: '서울특별시 강남구 역삼동 858',
    lat: 37.5006,
    lng: 127.0364,
    type: 'station' as const,
  },
  {
    id: 'loc-gangnam-st',
    name: '강남역',
    address: '서울특별시 강남구 역삼동 858',
    lat: 37.4979,
    lng: 127.0276,
    type: 'station' as const,
  },
  {
    id: 'loc-sinsa',
    name: '신사동',
    address: '서울특별시 강남구 신사동',
    lat: 37.5240,
    lng: 127.0227,
    type: 'neighborhood' as const,
  },
  {
    id: 'loc-seocho',
    name: '서초동',
    address: '서울특별시 서초구 서초동',
    lat: 37.4837,
    lng: 127.0324,
    type: 'neighborhood' as const,
  },
  {
    id: 'loc-jamsil-st',
    name: '잠실역',
    address: '서울특별시 송파구 잠실동',
    lat: 37.5133,
    lng: 127.1001,
    type: 'station' as const,
  },
  {
    id: 'loc-hongdae',
    name: '홍대입구역',
    address: '서울특별시 마포구 서교동',
    lat: 37.5563,
    lng: 126.9236,
    type: 'station' as const,
  },
];

export function searchLocations(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return LOCATION_CANDIDATES.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.address.toLowerCase().includes(q)
  );
}
