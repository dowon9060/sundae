import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, layout, spacing, typography } from '../constants/theme';
import type { NearbyStore } from '../types/store';
import { DayOfWeekTabs } from './DayOfWeekTabs';
import { StoreCard } from './StoreCard';

interface Props {
  stores: NearbyStore[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  dayOfWeek: number;
  onChangeDay: (dayOfWeek: number) => void;
  onRefresh: () => void;
  onPressStore: (id: string) => void;
  onLikeChange?: (storeId: string, liked: boolean, likeCount: number) => void;
  onVerifyChange?: (
    storeId: string,
    verified: boolean,
    verifyCount: number
  ) => void;
}

const EMPTY_NO_STORES = '이 요일에 운영하는 판매점이 없습니다.';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function StoreListEmpty({
  error,
  dayOfWeek,
}: {
  error: string | null;
  dayOfWeek: number;
}) {
  const dayLabel = DAY_LABELS[dayOfWeek] ?? '';
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyMain}>휑~~~</Text>
      <Text style={styles.emptySecondary}>
        {error ||
          (dayLabel
            ? `${dayLabel}요일에 운영하는 판매점이 없습니다.`
            : EMPTY_NO_STORES)}
      </Text>
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
  onRefresh,
  onPressStore,
  onLikeChange,
  onVerifyChange,
}: Props) {
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

      {loading && stores.length === 0 ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={stores}
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
            <StoreListEmpty error={error} dayOfWeek={dayOfWeek} />
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
