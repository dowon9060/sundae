/** 지도 마커용 카테고리별 아이콘 (HTML/emoji + SVG + 기본 트럭 data URI) */

import { FOOD_TRUCK_MARKER_DATA_URI } from './foodTruckMarkerData';
import type { StoreCategory } from '../types/store';

export type MapStoreCategory = Exclude<StoreCategory, 'all'>;

/** 노란색 붕어빵(빵) 모양 SVG */
const BUNGEOPPANG_MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="bun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE566"/>
      <stop offset="55%" stop-color="#FFC933"/>
      <stop offset="100%" stop-color="#F0A202"/>
    </linearGradient>
  </defs>
  <ellipse cx="28" cy="33" rx="23" ry="17" fill="url(#bun)" stroke="#D4920A" stroke-width="2.2"/>
  <path d="M48 33 L61 21 L57 33 L61 45 Z" fill="url(#bun)" stroke="#D4920A" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M18 18 Q28 7 40 17" fill="#FFD54A" stroke="#D4920A" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M22 48 Q28 56 36 49" fill="#FFD54A" stroke="#D4920A" stroke-width="1.6" stroke-linejoin="round"/>
  <circle cx="16" cy="29" r="3.2" fill="#5D4037"/>
  <circle cx="15.1" cy="28.1" r="1.1" fill="#FFF8E1"/>
  <path d="M8 35 Q5 37 8 39" fill="none" stroke="#B87500" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M18 27 L38 27 M18 33 L42 33 M18 39 L36 39 M24 21 L24 45 M32 20 L32 46 M40 24 L40 42" stroke="#E6A800" stroke-width="1" opacity="0.35"/>
</svg>`;

export const BUNGEOPPANG_MARKER_DATA_URI =
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(BUNGEOPPANG_MARKER_SVG);

/** 마커 배지 배경색 */
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
  bungeoppang: BUNGEOPPANG_MARKER_DATA_URI,
};

/** 마커 이모지 (기타는 트럭 이미지 사용) */
export const CATEGORY_MARKER_EMOJI: Record<MapStoreCategory, string> = {
  sundae: '🍲',
  bungeoppang: '',
  dakkochi: '🍢',
  mandu: '🥟',
  takoyaki: '🐙',
  chicken: '🍗',
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
