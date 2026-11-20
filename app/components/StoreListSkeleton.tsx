import { StyleSheet, View } from 'react-native';
import { colors, layout, spacing } from '../constants/theme';

function SkeletonCard() {
  return (
    <View style={styles.card} accessibilityLabel="불러오는 중">
      <View style={styles.thumb} />
      <View style={styles.body}>
        <View style={[styles.line, styles.lineTitle]} />
        <View style={[styles.line, styles.lineMid]} />
        <View style={[styles.line, styles.lineShort]} />
        <View style={[styles.line, styles.lineShort]} />
      </View>
    </View>
  );
}

/** 목록 로딩 시 카드 형태 자리 표시 */
export function StoreListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
    marginHorizontal: layout.screenPadding,
    marginBottom: layout.cardGap,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: layout.thumbRadius,
    backgroundColor: colors.surfaceElevated,
  },
  body: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 4,
    gap: 10,
  },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceElevated,
  },
  lineTitle: {
    width: '78%',
    height: 16,
  },
  lineMid: {
    width: '64%',
  },
  lineShort: {
    width: '42%',
  },
});
