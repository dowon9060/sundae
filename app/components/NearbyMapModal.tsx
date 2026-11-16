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

export function NearbyMapModal({
  visible,
  title = '기타 지도',
  stores: initialStores,
  centerLat,
  centerLng,
  category = 'other',
  dayOfWeek,
  onClose,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<NearbyStore | null>(null);
  const [mapStores, setMapStores] = useState<NearbyStore[]>(initialStores);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const seqRef = useRef(0);
  const lastFetchRef = useRef(0);

  useEffect(() => {
    if (!visible) {
      setSelected(null);
      return;
    }
    setMapStores(initialStores);
  }, [visible, initialStores]);

  const markers = useMemo<MapMarker[]>(() => {
    const storePins: MapMarker[] = mapStores.map((s) => ({
      lat: s.lat,
      lng: s.lng,
      label: s.name,
      kind: 'store' as const,
    }));
    return [
      {
        lat: centerLat,
        lng: centerLng,
        label: '현위치',
        kind: 'user' as const,
      },
      ...storePins,
    ];
  }, [mapStores, centerLat, centerLng]);

  const loadNearby = useCallback(
    async (lat: number, lng: number) => {
      const now = Date.now();
      if (now - lastFetchRef.current < 600) return;
      lastFetchRef.current = now;
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
        setMapStores(data);
        setSelected((prev) =>
          prev && data.some((s) => s.id === prev.id) ? prev : null
        );
      } catch {
        // 네트워크 실패 시 기존 마커 유지
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
            {mapStores.length > 0
              ? `지도 중심 주변 ${mapStores.length}곳 · 이동 후 멈추면 다시 불러옵니다.`
              : '지도를 움직인 뒤 멈추면 주변 판매점을 불러옵니다.'}
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
              markers={markers}
              onCameraIdle={(lat, lng) => {
                void loadNearby(lat, lng);
              }}
              onPressMarker={(index) => {
                if (index <= 0) return;
                const store = mapStores[index - 1];
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
