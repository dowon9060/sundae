import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, layout, spacing } from '../constants/theme';
import type { StoreCategory } from '../types/store';

const TABS: { key: StoreCategory; label: string }[] = [
  { key: 'sundae', label: '순대차' },
  { key: 'chicken', label: '통닭' },
  { key: 'other', label: '타코야끼' },
];

interface Props {
  value: StoreCategory;
  onChange: (value: StoreCategory) => void;
  onPressTakoyakiMap?: () => void;
}

export function CategoryTabs({ value, onChange, onPressTakoyakiMap }: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
      >
        {TABS.map((tab) => {
          const active = value === 'all' ? false : tab.key === value;
          return (
            <View key={tab.key} style={styles.tabGroup}>
              <Pressable
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onChange(value === tab.key ? 'all' : tab.key)}
              >
                <Text style={[styles.label, active && styles.labelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
              {tab.key === 'other' && onPressTakoyakiMap ? (
                <Pressable style={styles.mapChip} onPress={onPressTakoyakiMap}>
                  <Text style={styles.mapChipLabel}>지도로 보기</Text>
                </Pressable>
              ) : null}
            </View>
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
  tabGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    height: layout.chipHeight,
    paddingHorizontal: 18,
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
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    fontSize: 14,
  },
  labelActive: {
    color: colors.text,
    fontFamily: fonts.bold,
  },
  mapChip: {
    height: layout.chipHeight,
    paddingHorizontal: 14,
    borderRadius: layout.chipRadius,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapChipLabel: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 13,
  },
});
