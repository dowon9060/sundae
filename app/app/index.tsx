import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryTabs } from '../components/CategoryTabs';
import { LocationHeader } from '../components/LocationHeader';
import { StoreList } from '../components/StoreList';
import { colors, fonts, spacing } from '../constants/theme';
import { useLocation } from '../hooks/useLocation';
import { useNearbyStores } from '../hooks/useNearbyStores';
import type { StoreCategory } from '../types/store';

export default function HomeScreen() {
  const router = useRouter();
  const { location, loading: locLoading, permissionDenied, refreshGps } =
    useLocation();
  const [category, setCategory] = useState<StoreCategory>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { stores, loading, error, refresh } = useNearbyStores(
    location?.lat,
    location?.lng,
    category
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (location?.source === 'gps') {
        await refreshGps();
      }
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [location?.source, refresh, refreshGps]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LocationHeader
        address={location?.address || '위치 설정 중...'}
        onPressAddress={() => router.push('/location')}
        onPressGps={() => {
          void refreshGps().then(() => refresh());
        }}
      />
      {permissionDenied ? (
        <Text style={styles.hint}>
          위치 권한이 꺼져 있어 저장된 주소로 검색합니다.
        </Text>
      ) : null}
      <CategoryTabs value={category} onChange={setCategory} />
      <StoreList
        stores={stores}
        loading={loading || locLoading}
        refreshing={refreshing}
        error={error}
        onRefresh={() => {
          void onRefresh();
        }}
        onPressStore={(id) => router.push(`/store/${id}`)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hint: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 12,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
});
