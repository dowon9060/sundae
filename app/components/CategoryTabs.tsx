import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CATEGORY_CHIP_IMAGES } from '../constants/categoryImages';
import { colors, fonts, layout, spacing, typography } from '../constants/theme';
import { CATEGORY_LABELS, type StoreCategory } from '../types/store';

/** 칩에 보이는 짧은 라벨 (긴 이름은 줄임) */
const CHIP_LABELS: Record<StoreCategory, string> = {
  all: '전체',
  sundae: '순대',
  bungeoppang: '붕어빵',
  dakkochi: '닭꼬치',
  mandu: '만두',
  takoyaki: '타코',
  chicken: '통닭',
  gopchang: '곱창',
  hotteok: '호떡',
  hoe: '회',
  other: '기타',
};

const TABS: { key: StoreCategory; label: string; chipLabel: string }[] = [
  { key: 'all', label: '전체', chipLabel: CHIP_LABELS.all },
  {
    key: 'sundae',
    label: CATEGORY_LABELS.sundae,
    chipLabel: CHIP_LABELS.sundae,
  },
  {
    key: 'bungeoppang',
    label: CATEGORY_LABELS.bungeoppang,
    chipLabel: CHIP_LABELS.bungeoppang,
  },
  {
    key: 'dakkochi',
    label: CATEGORY_LABELS.dakkochi,
    chipLabel: CHIP_LABELS.dakkochi,
  },
  { key: 'mandu', label: CATEGORY_LABELS.mandu, chipLabel: CHIP_LABELS.mandu },
  {
    key: 'takoyaki',
    label: CATEGORY_LABELS.takoyaki,
    chipLabel: CHIP_LABELS.takoyaki,
  },
  {
    key: 'chicken',
    label: CATEGORY_LABELS.chicken,
    chipLabel: CHIP_LABELS.chicken,
  },
  {
    key: 'gopchang',
    label: CATEGORY_LABELS.gopchang,
    chipLabel: CHIP_LABELS.gopchang,
  },
  {
    key: 'hotteok',
    label: CATEGORY_LABELS.hotteok,
    chipLabel: CHIP_LABELS.hotteok,
  },
  { key: 'hoe', label: CATEGORY_LABELS.hoe, chipLabel: CHIP_LABELS.hoe },
  { key: 'other', label: CATEGORY_LABELS.other, chipLabel: CHIP_LABELS.other },
];

interface Props {
  value: StoreCategory;
  onChange: (value: StoreCategory) => void;
  /** 주변 푸드트럭 지도 */
  onPressMap?: () => void;
}

export function CategoryTabs({ value, onChange, onPressMap }: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
      >
        {onPressMap ? (
          <Pressable
            style={styles.mapChip}
            onPress={onPressMap}
            accessibilityRole="button"
            accessibilityLabel="지도로 보기"
          >
            <Text
              style={styles.mapChipLabel}
              allowFontScaling
              maxFontSizeMultiplier={1.35}
            >
              지도
            </Text>
          </Pressable>
        ) : null}
        {TABS.map((tab) => {
          const active = value === tab.key;
          const image =
            tab.key === 'all' ? undefined : CATEGORY_CHIP_IMAGES[tab.key];
          return (
            <Pressable
              key={tab.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(tab.key)}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
            >
              {image ? (
                <Image
                  source={image}
                  style={styles.chipImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.allIcon}>
                  <Text style={[styles.allIconText, active && styles.labelActive]}>
                    전체
                  </Text>
                </View>
              )}
              {tab.key !== 'all' ? (
                <Text
                  style={[styles.label, active && styles.labelActive]}
                  allowFontScaling
                  maxFontSizeMultiplier={1.2}
                  numberOfLines={1}
                >
                  {tab.chipLabel}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 0,
    flexShrink: 0,
  },
  scroll: {
    flexGrow: 0,
  },
  row: {
    paddingHorizontal: layout.screenPadding,
    gap: 8,
    paddingBottom: spacing.md,
    alignItems: 'flex-end',
  },
  chip: {
    minWidth: 56,
    minHeight: 64,
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 6,
    borderRadius: 16,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  chipActive: {
    backgroundColor: colors.chipActive,
    borderColor: colors.chipBorderActive,
    borderWidth: 2,
  },
  chipImage: {
    width: 32,
    height: 32,
  },
  allIcon: {
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  allIconText: {
    ...typography.chipBold,
    fontSize: 13,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  labelActive: {
    fontFamily: fonts.bold,
    color: colors.text,
  },
  mapChip: {
    minWidth: 56,
    minHeight: 64,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapChipLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: 18,
    color: '#FFFFFF',
  },
});
