/** 지도 마커용 카테고리별 아이콘 (이미지 data URI + 기본 트럭) */

import { CATEGORY_MARKER_IMAGE_DATA } from './categoryMarkerImages';
import { FOOD_TRUCK_MARKER_DATA_URI } from './foodTruckMarkerData';
import type { StoreCategory } from '../types/store';

export type MapStoreCategory = Exclude<StoreCategory, 'all'>;

/** 마커 배지 테두리색 */
export const CATEGORY_MARKER_COLORS: Record<MapStoreCategory, string> = {
  sundae: '#E85D4C',
  bungeoppang: '#F0A202',
  dakkochi: '#D94F30',
  mandu: '#C9A227',
  takoyaki: '#8B5A2B',
  chicken: '#E67E22',
  gopchang: '#A0522D',
  hotteok: '#CD853F',
  hoe: '#1E90FF',
  other: '#2FBF5B',
};

/** 커스텀 이미지 마커 (우선). 없으면 이모지/트럭 */
export const CATEGORY_MARKER_IMAGE: Partial<Record<MapStoreCategory, string>> = {
  sundae: CATEGORY_MARKER_IMAGE_DATA.sundae,
  bungeoppang: CATEGORY_MARKER_IMAGE_DATA.bungeoppang,
  dakkochi: CATEGORY_MARKER_IMAGE_DATA.dakkochi,
  mandu: CATEGORY_MARKER_IMAGE_DATA.mandu,
  takoyaki: CATEGORY_MARKER_IMAGE_DATA.takoyaki,
  chicken: CATEGORY_MARKER_IMAGE_DATA.chicken,
};

/** 마커 이모지 (이미지 없고 기타가 아닐 때) */
export const CATEGORY_MARKER_EMOJI: Record<MapStoreCategory, string> = {
  sundae: '',
  bungeoppang: '',
  dakkochi: '',
  mandu: '',
  takoyaki: '',
  chicken: '',
  gopchang: '🥩',
  hotteok: '🥞',
  hoe: '🦑',
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
    case 'gopchang':
    case 'hotteok':
    case 'hoe':
    case 'other':
      return category;
    default:
      return 'other';
  }
}
