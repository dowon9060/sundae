/** 앱 로고 (스플래시·아이콘) — public/sundea_logo.png */
export const appLogo = require('../assets/images/sundea_logo.png');

/** 리스팅·상세 등 실제 사진이 없을 때 대체 이미지 — public/sundea_image.png */
export const storePlaceholder = require('../assets/images/sundea_image.png');

/** 기존 import 호환 — 리스팅 대체 이미지 */
export const foodTruckIcon = storePlaceholder;

const STOCK_HOSTS = [
  'pexels.com',
  'unsplash.com',
  'picsum.photos',
  'placeholder',
];

/** 스톡·가상 URL은 없는 것으로 취급 */
export function resolveStorePhotoUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (STOCK_HOSTS.some((h) => lower.includes(h))) return null;
  return url;
}
