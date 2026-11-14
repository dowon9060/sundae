import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, layout, spacing } from '../constants/theme';
import type { BusinessHour } from '../types/store';

interface Props {
  hours: BusinessHour[];
}

export function BusinessHours({ hours }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>요일별 운영시간</Text>
      <View style={styles.grid}>
        {hours.map((h) => (
          <View key={h.day_of_week} style={styles.row}>
            <Text style={styles.day}>{h.day_label}</Text>
            <Text style={styles.time}>
              {h.is_closed ? '휴무' : `${h.open_time} ~ ${h.close_time}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  day: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 14,
    width: 28,
  },
  time: {
    fontFamily: fonts.regular,
    color: colors.text,
    fontSize: 14,
  },
});
