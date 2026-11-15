import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, layout, spacing } from '../constants/theme';

interface Props {
  onPress: () => void;
}

export function RegisterStoreCard({ onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.card} onPress={onPress}>
        <Text style={styles.title}>순대차 등록</Text>
        <Text style={styles.sub}>새로운 판매점을 등록 요청해 주세요</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 16,
  },
  sub: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 13,
  },
});
