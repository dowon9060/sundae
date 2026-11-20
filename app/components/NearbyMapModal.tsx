import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  androidFont,
  colors,
  fonts,
  layout,
  spacing,
  typography,
} from '../constants/theme';
import { fetchNearbyStores } from '../services/api';
import { resolveMarkerCategory } from '../constants/mapMarkerIcons';
import type { NearbyStore, StoreCategory } from '../types/store';
import { MapStoreSheet } from './MapStoreSheet';
import { NaverMap, type MapMarker } from './NaverMap';

interface Props {
  visible: boolean;
  title?: string;
  /** 초기 표시용 (열릴 때 한 번) */
  stores: NearbyStore[];
  centerLat: number;
  centerLng: number;
  category?: StoreCategory;
  dayOfWeek: number;
  onClose: () => void;
}

const RADIUS_M = 5000;
/** 카메라 idle 연속 호출 방지 */
const FETCH_GAP_MS = 700;
/** 너무 가까운 재조회 스킵 (약 40m) */
const MIN_MOVE_DEG = 0.0004;

export function NearbyMapModal({
  visible,
  title = '주변 지도',
  stores: initialStores,
  centerLat,
  centerLng,
  category = 'all',
  dayOfWeek,
  onClose,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<NearbyStore | null>(null);
  const [mapStores, setMapStores] = useState<NearbyStore[]>(initialStores);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const seqRef = useRef(0);
  const lastFetchRef = useRef(0);
  const lastQueryRef = useRef({ lat: centerLat, lng: centerLng });

  useEffect(() => {
    if (!visible) {
      setSelected(null);
      return;
    }
    setMapStores(initialStores);
    lastQueryRef.current = { lat: centerLat, lng: centerLng };
  }, [visible, initialStores, centerLat, centerLng]);

  const markers = useMemo<MapMarker[]>(
    () =>
      mapStores.map((s) => ({
        lat: s.lat,
        lng: s.lng,
        label: s.name,
        kind: 'store' as const,
        category: resolveMarkerCategory(s.category),
      })),
    [mapStores]
  );

  const loadNearby = useCallback(
    async (lat: number, lng: number) => {
      const now = Date.now();
      if (now - lastFetchRef.current < FETCH_GAP_MS) return;

      const prev = lastQueryRef.current;
      if (
        Math.abs(prev.lat - lat) < MIN_MOVE_DEG &&
        Math.abs(prev.lng - lng) < MIN_MOVE_DEG
      ) {
        return;
      }

      lastFetchRef.current = now;
      lastQueryRef.current = { lat, lng };
      const seq = ++seqRef.current;
      setLoadingNearby(true);
      try {
        const data = await fetchNearbyStores({
          lat,
          lng,
          category,
          radius: RADIUS_M,
          day: dayOfWeek,
        });
        if (seq !== seqRef.current) return;
        const openStores = data.filter((s) => !s.is_closed_on_day);
        setMapStores(openStores);
        setSelected((prevSel) =>
          prevSel && openStores.some((s) => s.id === prevSel.id)
            ? prevSel
            : null
        );
      } catch (err) {
        if (__DEV__) {
          console.warn(
            '[NearbyMapModal] nearby fetch failed',
            err instanceof Error ? err.message : err
          );
        }
      } finally {
        if (seq === seqRef.current) setLoadingNearby(false);
      }
    },
    [category, dayOfWeek]
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>닫기</Text>
          </Pressable>
        </View>

        <View style={styles.hintRow}>
          <Text style={styles.hint}>
            지도를 옮기면 가운데 핀 기준으로 주변 판매점을 불러와요
            {mapStores.length > 0 ? `, ${mapStores.length}곳` : ''}.
          </Text>
          {loadingNearby ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : null}
        </View>

        <View style={styles.mapWrap}>
          {visible ? (
            <NaverMap
              key={`browse-${centerLat.toFixed(4)}-${centerLng.toFixed(4)}`}
              lat={centerLat}
              lng={centerLng}
              zoom={15}
              navigable
              lockCenter
              centerPin
              centerPinLabel="탐색 위치"
              centerPinTone="browse"
              markers={markers}
              onCameraIdle={(lat, lng) => {
                void loadNearby(lat, lng);
              }}
              onPressMarker={(index) => {
                const store = mapStores[index];
                if (!store) return;
                setSelected(store);
              }}
            />
          ) : null}

          <MapStoreSheet
            store={selected}
            onClose={() => setSelected(null)}
            onPressDetail={(storeId) => {
              setSelected(null);
              onClose();
              router.push(`/store/${storeId}`);
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 18,
    lineHeight: 27,
    ...androidFont,
  },
  close: {
    fontFamily: fonts.medium,
    color: colors.accent,
    fontSize: 16,
    lineHeight: 24,
    ...androidFont,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.sm,
  },
  hint: {
    ...typography.caption,
    flex: 1,
  },
  mapWrap: {
    flex: 1,
    marginHorizontal: layout.screenPadding,
    marginBottom: layout.screenPadding,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 280,
    position: 'relative',
  },
});
