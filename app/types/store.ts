export type StoreCategory =
  | 'sundae'
  | 'bungeoppang'
  | 'dakkochi'
  | 'mandu'
  | 'takoyaki'
  | 'chicken'
  | 'other'
  | 'all';
export type BusinessStatus = 'expected' | 'confirmed_open' | 'unknown';

export interface SavedLocation {
  lat: number;
  lng: number;
  address: string;
  source: 'gps' | 'manual';
  updatedAt: string;
}

export interface NearbyStore {
  id: string;
  name: string;
  category: Exclude<StoreCategory, 'all'>;
  description: string | null;
  photo_url: string | null;
  status: string;
  business_status: BusinessStatus;
  lat: number;
  lng: number;
  address: string;
  location_note: string | null;
  location_updated_at: string;
  distance_m: number;
  location_stale: boolean;
  menu_summary: string | null;
  today_hours_label: string | null;
  is_closed_on_day?: boolean;
  like_count: number;
  liked?: boolean;
}

export interface StoreDetail extends Omit<NearbyStore, 'distance_m'> {
  distance_m: number | null;
}

export interface MenuItem {
  id: number;
  store_id: string;
  name: string;
  price: number;
  photo_url: string | null;
  is_available: boolean;
  sort_order: number;
}

export interface BusinessHour {
  id: number;
  store_id: string;
  day_of_week: number;
  day_label: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

export interface LocationSearchResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'neighborhood' | 'station';
}

export const CATEGORY_LABELS: Record<Exclude<StoreCategory, 'all'>, string> = {
  sundae: '순대차',
  bungeoppang: '붕어빵',
  dakkochi: '닭꼬치',
  mandu: '만두',
  takoyaki: '타코야키',
  chicken: '치킨',
  other: '기타',
};

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function businessStatusLabel(status: BusinessStatus): string {
  switch (status) {
    case 'expected':
      return '오늘 예상';
    case 'confirmed_open':
      return '영업 확인';
    default:
      return '정보 없음';
  }
}
