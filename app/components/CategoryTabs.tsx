import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';
import type { StoreCategory } from '../types/store';

const TABS: { key: StoreCategory; label: string }[] = [
  { key: 'sundae', label: '순대차' },
  { key: 'chicken', label: '통닭' },
  { key: 'other', label: '기타' },
];

interface Props {
  value: StoreCategory;
  onChange: (value: StoreCategory) => void;
}

export function CategoryTabs({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {TABS.map((tab) => {
        const active = value === 'all' ? false : tab.key === value;
        return (
          <Pressable
            key={tab.key}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() =>
              onChange(value === tab.key ? 'all' : tab.key)
            }
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.chipBorder,
  },
  chipActive: {
    backgroundColor: colors.chipActive,
    borderColor: colors.textSecondary,
  },
  label: {
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    fontSize: 14,
  },
  labelActive: {
    color: colors.text,
    fontFamily: fonts.bold,
  },
});
