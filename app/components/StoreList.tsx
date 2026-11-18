import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fonts, layout, spacing, typography } from '../constants/theme';
import type { NearbyStore } from '../types/store';
import { DayOfWeekTabs, getTodayDayOfWeek } from './DayOfWeekTabs';
import { StoreCard } from './StoreCard';

interface Props {
  stores: NearbyStore[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  dayOfWeek: number;
  onChangeDay: (dayOfWeek: number) => void;
  openNowOnly?: boolean;
  onChangeOpenNow?: (value: boolean) => void;
  onRefresh: () => void;
  onPressStore: (id: string) => void;
  onLikeChange?: (storeId: string, liked: boolean, likeCount: number) => void;
  onVerifyChange?: (
    storeId: string,
    verified: boolean,
    verifyCount: number,
    todayVerifyCount: number
  ) => void;
}

const EMPTY_NO_STORES = '이 요일에 운영하는 판매점이 없습니다.';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function StoreListEmpty({
  error,
  dayOfWeek,
  openNowOnly,
}: {
  error: string | null;
  dayOfWeek: number;
  openNowOnly: boolean;
}) {
  const dayLabel = DAY_LABELS[dayOfWeek] ?? '';
  const emptyText = openNowOnly
    ? '지금 영업 중인 판매점이 없습니다.'
    : dayLabel
      ? `${dayLabel}요일에 운영하는 판매점이 없습니다.`
      : EMPTY_NO_STORES;
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyMain}>휑~~~</Text>
      <Text style={styles.emptySecondary}>{error || emptyText}</Text>
    </View>
  );
}

export function StoreList({
  stores,
  loading,
  refreshing,
  error,
  dayOfWeek,
  onChangeDay,
  openNowOnly = false,
  onChangeOpenNow,
  onRefresh,
  onPressStore,
  onLikeChange,
  onVerifyChange,
}: Props) {
  const isToday = dayOfWeek === getTodayDayOfWeek();
  const visibleStores =
    openNowOnly && isToday
      ? stores.filter((s) => Boolean(s.is_open_now))
      : stores;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 주변 판매점</Text>
        <View style={styles.sortRow}>
          <Text style={styles.sort}>거리순</Text>
          <Ionicons name="swap-vertical" size={14} color={colors.textSecondary} />
        </View>
      </View>

      <DayOfWeekTabs value={dayOfWeek} onChange={onChangeDay} />

      {isToday && onChangeOpenNow ? (
        <View style={styles.filterRow}>
          <Pressable
            style={[styles.filterChip, openNowOnly && styles.filterChipActive]}
            onPress={() => onChangeOpenNow(!openNowOnly)}
            accessibilityRole="button"
            accessibilityState={{ selected: openNowOnly }}
            accessibilityLabel="지금 영업 중만 보기"
          >
            <Text
              style={[
                styles.filterLabel,
                openNowOnly && styles.filterLabelActive,
              ]}
            >
              지금 영업 중
            </Text>
          </Pressable>
        </View>
      ) : null}

      {loading && stores.length === 0 ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={visibleStores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StoreCard
              store={item}
              onPress={() => onPressStore(item.id)}
              onLikeChange={onLikeChange}
              onVerifyChange={onVerifyChange}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.text}
            />
          }
          ListEmptyComponent={
            <StoreListEmpty
              error={error}
              dayOfWeek={dayOfWeek}
              openNowOnly={openNowOnly && isToday}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.subtitle,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  sort: {
    ...typography.caption,
    lineHeight: 20,
  },
  filterRow: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.chipBorder,
  },
  filterChipActive: {
    backgroundColor: colors.chipActive,
    borderColor: colors.chipBorderActive,
  },
  filterLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filterLabelActive: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  listContent: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 48,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyMain: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptySecondary: {
    ...typography.caption,
    textAlign: 'center',
  },
});
