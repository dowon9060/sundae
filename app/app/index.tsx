import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryTabs } from '../components/CategoryTabs';
import { getTodayDayOfWeek } from '../components/DayOfWeekTabs';
import { LocationHeader } from '../components/LocationHeader';
import { NearbyMapModal } from '../components/NearbyMapModal';
import { RegisterStoreCard } from '../components/RegisterStoreCard';
import { RegisterStoreSheet } from '../components/RegisterStoreSheet';
import { StoreList } from '../components/StoreList';
import { colors, fonts, spacing } from '../constants/theme';
import { useLocation } from '../hooks/useLocation';
import { useNearbyStores } from '../hooks/useNearbyStores';
import { useRefreshGate } from '../hooks/useRefreshGate';
import type { StoreCategory } from '../types/store';

export default function HomeScreen() {
  const router = useRouter();
  const { location, loading: locLoading, permissionDenied, refreshGps } =
    useLocation();
  const [category, setCategory] = useState<StoreCategory>('all');
  const [dayOfWeek, setDayOfWeek] = useState(getTodayDayOfWeek);
  const [refreshing, setRefreshing] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [takoyakiMapOpen, setTakoyakiMapOpen] = useState(false);
  const { tryRefresh, hint } = useRefreshGate(10_000);

  // 홈 복귀 시 오늘(서울) 요일만 맞춤 (값이 같으면 상태 유지 → 불필요 재요청 방지)
  useFocusEffect(
    useCallback(() => {
      const today = getTodayDayOfWeek();
      setDayOfWeek((prev) => (prev === today ? prev : today));
    }, [])
  );

  const { stores, loading, error, refresh, updateStoreLike } = useNearbyStores(
    location?.lat,
    location?.lng,
    category,
    dayOfWeek
  );

  // 지도 열리면 타코야끼(other) 목록을 별도 조회 (카테고리 전환 레이스 방지)
  const { stores: takoyakiStores, refresh: refreshTakoyaki } = useNearbyStores(
    location?.lat,
    location?.lng,
    'other',
    dayOfWeek,
    takoyakiMapOpen
  );

  const mapStores = useMemo(() => {
    if (category === 'other' && stores.length > 0) return stores;
    if (takoyakiStores.length > 0) return takoyakiStores;
    return category === 'other' ? stores : takoyakiStores;
  }, [category, stores, takoyakiStores]);

  const listMessage = hint || error;

  const onRefresh = useCallback(() => {
    void tryRefresh(async () => {
      setRefreshing(true);
      try {
        const today = getTodayDayOfWeek();
        setDayOfWeek((prev) => (prev === today ? prev : today));
        await refreshGps();
        await refresh({ force: true });
        if (takoyakiMapOpen) {
          await refreshTakoyaki({ force: true });
        }
      } finally {
        setRefreshing(false);
      }
    });
  }, [tryRefresh, refreshGps, refresh, refreshTakoyaki, takoyakiMapOpen]);

  const onPressGps = useCallback(() => {
    void tryRefresh(async () => {
      await refreshGps();
      await refresh({ force: true });
    });
  }, [tryRefresh, refreshGps, refresh]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LocationHeader
        address={location?.address || '위치 설정 중...'}
        onPressAddress={() => router.push('/location')}
        onPressGps={onPressGps}
      />
      {permissionDenied ? (
        <Text style={styles.hint}>
          위치 권한이 꺼져 있어 저장된 주소로 검색합니다.
        </Text>
      ) : null}
      {hint && stores.length > 0 ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
      <CategoryTabs
        value={category}
        onChange={setCategory}
        onPressTakoyakiMap={() => {
          setTakoyakiMapOpen(true);
          setCategory('other');
        }}
      />
      <StoreList
        stores={stores}
        // 위치가 있으면 GPS 대기 중에도 목록 로딩만 표시 (스피너 고정 방지)
        loading={loading || (locLoading && !location)}
        refreshing={refreshing}
        dayOfWeek={dayOfWeek}
        onChangeDay={setDayOfWeek}
        error={listMessage}
        onRefresh={onRefresh}
        onPressStore={(id) => router.push(`/store/${id}`)}
        onLikeChange={updateStoreLike}
      />
      <RegisterStoreCard onPress={() => setRegisterOpen(true)} />
      <RegisterStoreSheet
        visible={registerOpen}
        defaultLocation={location?.address || ''}
        defaultLat={location?.lat}
        defaultLng={location?.lng}
        onClose={() => setRegisterOpen(false)}
      />
      {location ? (
        <NearbyMapModal
          visible={takoyakiMapOpen}
          title="타코야끼 지도"
          stores={mapStores}
          centerLat={location.lat}
          centerLng={location.lng}
          onClose={() => setTakoyakiMapOpen(false)}
        />
      ) : null}
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
