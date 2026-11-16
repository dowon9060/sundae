/** 지도 마커용 카테고리별 아이콘 (HTML/emoji + 기본 트럭 data URI) */

import { FOOD_TRUCK_MARKER_DATA_URI } from './foodTruckMarkerData';
import type { StoreCategory } from '../types/store';

export type MapStoreCategory = Exclude<StoreCategory, 'all'>;

/** 마커 배지 배경색 */
export const CATEGORY_MARKER_COLORS: Record<MapStoreCategory, string> = {
  sundae: '#E85D4C',
  bungeoppang: '#F0A202',
  dakkochi: '#D94F30',
  mandu: '#C9A227',
  takoyaki: '#8B5A2B',
  chicken: '#E67E22',
  other: '#2FBF5B',
};

/** 마커 이모지 (기타는 트럭 이미지 사용) */
export const CATEGORY_MARKER_EMOJI: Record<MapStoreCategory, string> = {
  sundae: '🍲',
  bungeoppang: '🐟',
  dakkochi: '🍢',
  mandu: '🥟',
  takoyaki: '🐙',
  chicken: '🍗',
  other: '',
};

export const DEFAULT_TRUCK_MARKER_URI = FOOD_TRUCK_MARKER_DATA_URI;

export function resolveMarkerCategory(
  category: string | null | undefined
): MapStoreCategory {
  switch (category) {
    case 'sundae':
    case 'bungeoppang':
    case 'dakkochi':
    case 'mandu':
    case 'takoyaki':
    case 'chicken':
    case 'other':
      return category;
    default:
      return 'other';
  }
}
