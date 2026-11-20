import { Ionicons } from '@expo/vector-icons';
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
  resolveStoreImageSource,
  resolveStorePhotoUrl,
} from '../../constants/images';
import { colors, fonts, spacing, typography } from '../../constants/theme';
import { useLocation } from '../../hooks/useLocation';
import {
  fetchStoreDetail,
  fetchStoreHours,
  fetchStoreMenus,
  verifyStorePresence,
} from '../../services/api';
import { getCurrentGpsCoords } from '../../services/location';
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
  const [verified, setVerified] = useState(false);
  const [verifyCount, setVerifyCount] = useState(0);
  const [todayVerifyCount, setTodayVerifyCount] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
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
    for (const url of store?.photo_urls ?? []) push(url);
    for (const m of menus) push(m.photo_url);
    return list;
  }, [store?.photo_url, store?.photo_urls, menus]);

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
        setVerified(Boolean(detail.verified));
        setVerifyCount(Number(detail.verify_count ?? 0));
        setTodayVerifyCount(Number(detail.today_verify_count ?? 0));
        setVerifyError(null);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : '상세 정보를 불러오지 못했어요.'
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
        setVerified(Boolean(detail.verified));
        setVerifyCount(Number(detail.verify_count ?? 0));
        setTodayVerifyCount(Number(detail.today_verify_count ?? 0));
      } catch (e) {
        if (cancelled) return;
        lastDistanceLocationKeyRef.current = null;
        if (__DEV__) {
          const msg =
            e instanceof Error ? e.message : '거리를 다시 계산하지 못했어요.';
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
        <Text style={styles.error}>{error || '판매점을 찾지 못했어요.'}</Text>
      </View>
    );
  }

  const destination: NavDestination = {
    name: store.name,
    lat: store.lat,
    lng: store.lng,
  };

  const storePhoto = resolveStorePhotoUrl(store.photo_url);
  const { source: storeImageSource, isPhoto: hasStorePhoto } =
    resolveStoreImageSource(store.photo_url, store.category);

  const previewUrls = [
    ...menus.map((m) => resolveStorePhotoUrl(m.photo_url)),
    storePhoto,
    ...(store.photo_urls ?? [])
      .map((url) => resolveStorePhotoUrl(url))
      .filter((url) => url !== storePhoto),
  ];

  const openLightbox = (url: string | null | undefined) => {
    if (allPhotos.length === 0) return;
    const resolved = resolveStorePhotoUrl(url);
    const idx = resolved ? allPhotos.indexOf(resolved) : 0;
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const onPressVerify = async () => {
    if (verifying || verified || !store) return;
    setVerifying(true);
    setVerifyError(null);

    const prevCount = verifyCount;
    const prevToday = todayVerifyCount;

    try {
      const coords = await getCurrentGpsCoords();
      if (!coords) {
        setVerifyError(
          '위치 권한이 필요해요. 설정에서 위치 권한을 켜 주세요.'
        );
        return;
      }

      const result = await verifyStorePresence(store.id, coords);
      setVerified(result.verified);
      setVerifyCount(result.verify_count);
      setTodayVerifyCount(result.today_verify_count);
      setStore((prev) =>
        prev
          ? {
              ...prev,
              verified: result.verified,
              verify_count: result.verify_count,
              today_verify_count: result.today_verify_count,
            }
          : prev
      );
    } catch (e) {
      setVerified(false);
      setVerifyCount(prevCount);
      setTodayVerifyCount(prevToday);
      setVerifyError(
        e instanceof Error
          ? e.message
          : '인증을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'
      );
    } finally {
      setVerifying(false);
    }
  };

  const verifyLabel = verified
    ? todayVerifyCount > 0
      ? `오늘 인증 ${todayVerifyCount}`
      : '오늘 인증함'
    : todayVerifyCount > 0
      ? `현장 인증하기 · 오늘 ${todayVerifyCount}`
      : '현장 인증하기';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => openLightbox(storePhoto)}>
          <Image
            source={storeImageSource}
            style={[styles.hero, !hasStorePhoto && styles.heroPlaceholder]}
            resizeMode={hasStorePhoto ? 'cover' : 'contain'}
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
              위치가 오래됐을 수 있어요. 마지막 갱신:{' '}
              {store.location_updated_at}
            </Text>
          ) : null}

          <View style={styles.verifyBlock}>
            <Text style={styles.verifyHint}>
              판매점 근처 300m 안에서 하루 한 번 인증할 수 있어요.
              {verifyCount > 0 ? ` 누적 ${verifyCount}회` : ''}
            </Text>
            <Pressable
              style={[
                styles.verifyBtn,
                verified && styles.verifyBtnDone,
                verifying && styles.verifyBtnDisabled,
              ]}
              onPress={() => {
                void onPressVerify();
              }}
              disabled={verifying || verified}
              accessibilityRole="button"
              accessibilityLabel={verifyLabel}
              accessibilityState={{ disabled: verifying || verified }}
            >
              {verifying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={verified ? 'checkmark-circle' : 'location'}
                  size={18}
                  color="#FFFFFF"
                />
              )}
              <Text style={styles.verifyBtnText}>{verifyLabel}</Text>
            </Pressable>
            {verifyError ? (
              <Text style={styles.verifyError}>{verifyError}</Text>
            ) : null}
          </View>
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
          category={store.category}
          onPress={() => setMapOpen(true)}
        />

        <View style={styles.reportSection}>
          <Pressable
            style={styles.reportButton}
            onPress={() => setReportOpen(true)}
          >
            <Text style={styles.reportButtonText}>정보 제보하기</Text>
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
        category={store.category}
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
  verifyBlock: {
    marginTop: spacing.md,
    gap: 8,
  },
  verifyHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  verifyBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  verifyBtnDone: {
    backgroundColor: colors.accentMuted,
  },
  verifyBtnDisabled: {
    opacity: 0.85,
  },
  verifyBtnText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  verifyError: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.danger,
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
