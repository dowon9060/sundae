import { Ionicons } from '@expo/vector-icons';
import {
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
import { StoreListSkeleton } from './StoreListSkeleton';

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
  onPressRegister?: () => void;
  onLikeChange?: (storeId: string, liked: boolean, likeCount: number) => void;
}

const EMPTY_NO_STORES = '이 요일에 운영하는 판매점이 없어요.';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function StoreListEmpty({
  error,
  dayOfWeek,
  openNowOnly,
  onPressRegister,
}: {
  error: string | null;
  dayOfWeek: number;
  openNowOnly: boolean;
  onPressRegister?: () => void;
}) {
  const dayLabel = DAY_LABELS[dayOfWeek] ?? '';
  const emptyText = openNowOnly
    ? '지금 영업 중인 판매점이 없어요.'
    : dayLabel
      ? `${dayLabel}요일에 운영하는 판매점이 없어요.`
      : EMPTY_NO_STORES;

  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="storefront-outline" size={40} color={colors.textMuted} />
      <Text style={styles.emptyMain}>{error || emptyText}</Text>
      <Text style={styles.emptySecondary}>
        다른 요일을 눌러 보거나, 아는 곳을 등록해 주세요.
      </Text>
      {onPressRegister ? (
        <Pressable
          style={styles.emptyCta}
          onPress={onPressRegister}
          accessibilityRole="button"
          accessibilityLabel="순대차 등록하기"
        >
          <Text style={styles.emptyCtaText}>등록하기</Text>
        </Pressable>
      ) : null}
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
  onPressRegister,
  onLikeChange,
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
        <Text style={styles.sortMeta}>가까운 순</Text>
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
        <StoreListSkeleton />
      ) : (
        <FlatList
          data={visibleStores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StoreCard
              store={item}
              onPress={() => onPressStore(item.id)}
              onLikeChange={onLikeChange}
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
              onPressRegister={onPressRegister}
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
  sortMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  filterRow: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
  },
  filterChip: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    justifyContent: 'center',
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
    marginTop: 40,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyMain: {
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: 'center',
  },
  emptySecondary: {
    ...typography.caption,
    textAlign: 'center',
  },
  emptyCta: {
    marginTop: spacing.sm,
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCtaText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
