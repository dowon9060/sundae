import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, layout, spacing, typography } from '../constants/theme';
import { CATEGORY_LABELS, type StoreCategory } from '../types/store';

const TABS: { key: StoreCategory; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'sundae', label: CATEGORY_LABELS.sundae },
  { key: 'bungeoppang', label: CATEGORY_LABELS.bungeoppang },
  { key: 'dakkochi', label: CATEGORY_LABELS.dakkochi },
  { key: 'mandu', label: CATEGORY_LABELS.mandu },
  { key: 'takoyaki', label: CATEGORY_LABELS.takoyaki },
  { key: 'chicken', label: CATEGORY_LABELS.chicken },
  { key: 'other', label: CATEGORY_LABELS.other },
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
          <Pressable style={styles.mapChip} onPress={onPressMap}>
            <Text
              style={styles.mapChipLabel}
              allowFontScaling
              maxFontSizeMultiplier={1.35}
            >
              지도로 보기
            </Text>
          </Pressable>
        ) : null}
        {TABS.map((tab) => {
          const active = value === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(tab.key)}
            >
              <Text
                style={[styles.label, active && styles.labelActive]}
                allowFontScaling
                maxFontSizeMultiplier={1.35}
              >
                {tab.label}
              </Text>
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
    alignItems: 'center',
  },
  chip: {
    minHeight: layout.chipHeight,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: layout.chipRadius,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.chipActive,
    borderColor: colors.chipBorderActive,
  },
  label: {
    ...typography.chip,
  },
  labelActive: {
    ...typography.chipBold,
  },
  mapChip: {
    minHeight: layout.chipHeight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: layout.chipRadius,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapChipLabel: {
    ...typography.chipBold,
    fontSize: 13,
    lineHeight: 20,
    color: '#FFFFFF',
  },
});
