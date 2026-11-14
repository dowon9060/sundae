import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fonts, layout, spacing, typography } from '../constants/theme';
import type { NearbyStore } from '../types/store';
import { StoreCard } from './StoreCard';

interface Props {
  stores: NearbyStore[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  onPressStore: (id: string) => void;
}

export function StoreList({
  stores,
  loading,
  refreshing,
  error,
  onRefresh,
  onPressStore,
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

      {loading && stores.length === 0 ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StoreCard store={item} onPress={() => onPressStore(item.id)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.text}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              {error || '주변에 표시할 판매점이 없습니다.'}
            </Text>
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
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 16,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sort: {
    ...typography.caption,
  },
  listContent: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  empty: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 48,
    paddingHorizontal: spacing.lg,
  },
});
