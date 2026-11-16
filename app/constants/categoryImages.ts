import type { ImageSourcePropType } from 'react-native';
import type { StoreCategory } from '../types/store';

/** 칩·UI용 카테고리 이미지 (public 원본 축소본) */
export const CATEGORY_CHIP_IMAGES: Partial<
  Record<Exclude<StoreCategory, 'all'>, ImageSourcePropType>
> = {
  sundae: require('../assets/images/categories/sundae.png'),
  bungeoppang: require('../assets/images/categories/bungeoppang.png'),
  dakkochi: require('../assets/images/categories/dakkochi.png'),
  mandu: require('../assets/images/categories/mandu.png'),
  takoyaki: require('../assets/images/categories/takoyaki.png'),
  chicken: require('../assets/images/categories/chicken.png'),
  gopchang: require('../assets/images/categories/gopchang.png'),
  hotteok: require('../assets/images/categories/hotteok.png'),
  hoe: require('../assets/images/categories/hoe.png'),
  other: require('../assets/images/categories/other.png'),
};
