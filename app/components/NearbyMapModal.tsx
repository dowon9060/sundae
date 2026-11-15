import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  androidFont,
  colors,
  fonts,
  layout,
  spacing,
  typography,
} from '../constants/theme';
import type { NearbyStore } from '../types/store';
import { MapStoreSheet } from './MapStoreSheet';
import { NaverMap, type MapMarker } from './NaverMap';

interface Props {
  visible: boolean;
  title?: string;
  stores: NearbyStore[];
  centerLat: number;
  centerLng: number;
  onClose: () => void;
}

export function NearbyMapModal({
  visible,
  title = '타코야끼 지도',
  stores,
  centerLat,
  centerLng,
  onClose,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<NearbyStore | null>(null);

  useEffect(() => {
    if (!visible) setSelected(null);
  }, [visible]);

  /** 0번=현위치, 이후=판매점 — 클릭 시 index-1 로 매핑 */
  const markers = useMemo<MapMarker[]>(() => {
    const storePins: MapMarker[] = stores.map((s) => ({
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
  }, [stores, centerLat, centerLng]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>닫기</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>
          {stores.length > 0
            ? `현위치 기준 · 주변 ${stores.length}곳 · 핀을 누르면 정보가 열립니다.`
            : '현위치를 중심으로 표시합니다. 주변에 판매점이 없습니다.'}
        </Text>

        <View style={styles.mapWrap}>
          {visible ? (
            <NaverMap
              key={`map-${centerLat.toFixed(5)}-${centerLng.toFixed(5)}-${stores.length}`}
              lat={centerLat}
              lng={centerLng}
              zoom={15}
              navigable
              lockCenter
              markers={markers}
              onPressMarker={(index) => {
                // 0 = 현위치 마커
                if (index <= 0) return;
                const store = stores[index - 1];
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
  hint: {
    ...typography.caption,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.sm,
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
