import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { MenuPhotoGallery } from '../../components/MenuPhotoGallery';
import { NavigationSheet } from '../../components/NavigationSheet';
import { PhotoLightbox } from '../../components/PhotoLightbox';
import { ReportSheet } from '../../components/ReportSheet';
import { StoreMap } from '../../components/StoreMap';
import {
  foodTruckIcon,
  resolveStorePhotoUrl,
} from '../../constants/images';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lastDistanceLocationKeyRef = useRef<string | null>(null);

  /** 등록된 실제 사진만 (스톡 제외) — 라이트박스 스와이프용 */
  const allPhotos = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();
    const push = (url: string | null | undefined) => {
      const resolved = resolveStorePhotoUrl(url);
      if (!resolved || seen.has(resolved)) return;
      seen.add(resolved);
      list.push(resolved);
    };
    push(store?.photo_url);
    for (const m of menus) push(m.photo_url);
    return list;
  }, [store?.photo_url, menus]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setStore(null);
    setMenus([]);
    setHours([]);
    setLoading(true);
    setError(null);
    lastDistanceLocationKeyRef.current = null;

    (async () => {
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
    // id 변경 시에만 전체 재로드 (위치는 별도 effect)
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (location?.lat == null || location?.lng == null) return;
    if (loading) return;
    if (!store || String(store.id) !== String(id)) return;

    const locationKey = `${location.lat},${location.lng}`;
    if (lastDistanceLocationKeyRef.current === locationKey) return;
    if (
      store.distance_m != null &&
      lastDistanceLocationKeyRef.current == null
    ) {
      lastDistanceLocationKeyRef.current = locationKey;
      return;
    }

    let cancelled = false;
    lastDistanceLocationKeyRef.current = locationKey;

    (async () => {
      try {
        const detail = await fetchStoreDetail(id, location.lat, location.lng);
        if (cancelled) return;
        setStore(detail);
      } catch (e) {
        if (cancelled) return;
        lastDistanceLocationKeyRef.current = null;
        if (__DEV__) {
          const msg =
            e instanceof Error ? e.message : '거리 정보를 갱신하지 못했습니다.';
          console.warn(msg);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, location?.lat, location?.lng, loading, store?.id, store?.distance_m]);

  if (loading && !store) {
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

  const storePhoto = resolveStorePhotoUrl(store.photo_url);

  const previewUrls = [
    ...menus.map((m) => resolveStorePhotoUrl(m.photo_url)),
    storePhoto,
  ];

  const openLightbox = (url: string | null | undefined) => {
    if (allPhotos.length === 0) return;
    const resolved = resolveStorePhotoUrl(url);
    const idx = resolved ? allPhotos.indexOf(resolved) : 0;
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => openLightbox(storePhoto)}>
          <Image
            source={storePhoto ? { uri: storePhoto } : foodTruckIcon}
            style={[styles.hero, !storePhoto && styles.heroPlaceholder]}
            resizeMode={storePhoto ? 'cover' : 'contain'}
          />
        </Pressable>

        <View style={styles.info}>
          <Text style={styles.name}>{store.name}</Text>
          <Text style={styles.meta}>
            {CATEGORY_LABELS[store.category] ?? '기타'} ·{' '}
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

        <MenuPhotoGallery
          urls={previewUrls}
          onPressPhoto={(_i, url) => openLightbox(url)}
        />
        <BusinessHours hours={hours} />
        <MenuList menus={menus} onPressPhoto={(url) => openLightbox(url)} />
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
      <PhotoLightbox
        visible={lightboxOpen}
        urls={allPhotos}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
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
  heroPlaceholder: {
    backgroundColor: '#FFF3E8',
    paddingVertical: 24,
  },
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
