import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, layout, spacing, typography } from '../constants/theme';
import type { NearbyStore } from '../types/store';
import { MapStoreSheet } from './MapStoreSheet';
import { NaverMap } from './NaverMap';

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

  const markers = stores.map((s) => ({
    lat: s.lat,
    lng: s.lng,
    label: s.name,
  }));

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
            ? `주변 ${stores.length}곳 · 핀을 누르면 정보가 열립니다. +/− 로 확대·축소할 수 있습니다.`
            : '주변에 표시할 판매점이 없습니다.'}
        </Text>

        <View style={styles.mapWrap}>
          {visible ? (
            <NaverMap
              key={`map-${markers.length}-${centerLat.toFixed(4)}-${centerLng.toFixed(4)}`}
              lat={centerLat}
              lng={centerLng}
              zoom={14}
              navigable
              markers={
                markers.length > 0
                  ? markers
                  : [{ lat: centerLat, lng: centerLng, label: '내 위치' }]
              }
              onPressMarker={(index) => {
                // '내 위치' 단독 마커일 때는 매장 없음
                if (stores.length === 0) return;
                const store = stores[index];
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
  },
  close: {
    fontFamily: fonts.medium,
    color: colors.accent,
    fontSize: 16,
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
