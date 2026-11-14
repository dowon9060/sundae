import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BusinessHours } from '../../components/BusinessHours';
import { MapModal } from '../../components/MapModal';
import { MenuList } from '../../components/MenuList';
import { NavigationSheet } from '../../components/NavigationSheet';
import { ReportSheet } from '../../components/ReportSheet';
import { StoreMap } from '../../components/StoreMap';
import { colors, fonts, spacing, typography } from '../../constants/theme';
import { useLocation } from '../../hooks/useLocation';
import {
  fetchStoreDetail,
  fetchStoreHours,
  fetchStoreMenus,
} from '../../services/api';
import type { NavDestination } from '../../services/navigation';
import {
  CATEGORY_LABELS,
  formatDistance,
  type BusinessHour,
  type MenuItem,
  type StoreDetail,
} from '../../types/store';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { location } = useLocation();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [detail, menuData, hourData] = await Promise.all([
          fetchStoreDetail(id, location?.lat, location?.lng),
          fetchStoreMenus(id),
          fetchStoreHours(id),
        ]);
        if (cancelled) return;
        setStore(detail);
        setMenus(menuData);
        setHours(hourData.hours);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : '상세 정보를 불러오지 못했습니다.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, location?.lat, location?.lng]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (error || !store) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || '판매점을 찾을 수 없습니다.'}</Text>
      </View>
    );
  }

  const destination: NavDestination = {
    name: store.name,
    lat: store.lat,
    lng: store.lng,
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {store.photo_url ? (
          <Image source={{ uri: store.photo_url }} style={styles.hero} />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]} />
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{store.name}</Text>
          <Text style={styles.meta}>
            {CATEGORY_LABELS[store.category]} ·{' '}
            {store.location_note || store.address}
          </Text>
          {store.distance_m != null ? (
            <Text style={styles.distance}>
              현재 위치에서 약 {formatDistance(store.distance_m)}
            </Text>
          ) : null}
          {store.location_stale ? (
            <Text style={styles.stale}>
              위치가 오래되었을 수 있습니다. 마지막 갱신:{' '}
              {store.location_updated_at}
            </Text>
          ) : null}
        </View>

        <BusinessHours hours={hours} />
        <MenuList menus={menus} />
        <StoreMap
          address={store.address}
          note={store.location_note}
          lat={store.lat}
          lng={store.lng}
          onPress={() => setMapOpen(true)}
        />

        <View style={styles.reportSection}>
          <Pressable
            style={styles.reportButton}
            onPress={() => setReportOpen(true)}
          >
            <Text style={styles.reportButtonText}>정보 제보</Text>
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.navButton} onPress={() => setNavOpen(true)}>
          <Text style={styles.navButtonText}>길찾기</Text>
        </Pressable>
      </View>

      <MapModal
        visible={mapOpen}
        address={store.address}
        note={store.location_note}
        lat={store.lat}
        lng={store.lng}
        name={store.name}
        onClose={() => setMapOpen(false)}
      />
      <NavigationSheet
        visible={navOpen}
        destination={destination}
        onClose={() => setNavOpen(false)}
      />
      <ReportSheet
        visible={reportOpen}
        storeId={store.id}
        storeName={store.name}
        onClose={() => setReportOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.lg,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  hero: {
    width: '100%',
    height: 220,
    backgroundColor: colors.surfaceElevated,
  },
  heroPlaceholder: {},
  info: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: 4,
  },
  name: {
    ...typography.hero,
  },
  meta: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 14,
  },
  distance: {
    ...typography.caption,
    marginTop: 4,
  },
  stale: {
    fontFamily: fonts.regular,
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  reportSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  reportButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  reportButtonText: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  navButton: {
    backgroundColor: colors.text,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  navButtonText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 16,
  },
  error: {
    fontFamily: fonts.regular,
    color: colors.danger,
    textAlign: 'center',
  },
});
