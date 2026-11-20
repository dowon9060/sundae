import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, spacing, typography } from '../constants/theme';

/** 표시 순서: 월…일. value는 DB/JS 기준 0=일 … 6=토 */
const DAYS: { value: number; label: string }[] = [
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' },
  { value: 0, label: '일' },
];

interface Props {
  value: number;
  onChange: (dayOfWeek: number) => void;
}

export function DayOfWeekTabs({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {DAYS.map((day) => {
        const active = day.value === value;
        return (
          <Pressable
            key={day.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(day.value)}
            hitSlop={4}
          >
            <Text
              style={[styles.label, active && styles.labelActive]}
              allowFontScaling
              maxFontSizeMultiplier={1.35}
            >
              {day.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Asia/Seoul 기준 오늘 요일 (0=일 … 6=토) */
export function getTodayDayOfWeek(): number {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    weekday: 'short',
  }).format(new Date());
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return dayMap[weekday] ?? new Date().getDay();
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.md,
    gap: 6,
  },
  chip: {
    flex: 1,
    minHeight: layout.dayChipHeight,
    minWidth: 36,
    paddingVertical: 10,
    borderRadius: 20,
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
    ...typography.dayChip,
    textAlign: 'center',
  },
  labelActive: {
    ...typography.dayChipBold,
  },
});
