import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MapStoreCategory } from '../constants/mapMarkerIcons';
import { colors, fonts, layout, spacing, typography } from '../constants/theme';
import { NaverMap, type MapMarker } from './NaverMap';

interface Props {
  address: string;
  note?: string | null;
  lat: number;
  lng: number;
  category?: MapStoreCategory;
  onPress: () => void;
}

export function StoreMap({
  address,
  note,
  lat,
  lng,
  category,
  onPress,
}: Props) {
  const markers = useMemo<MapMarker[]>(
    () => [
      {
        lat,
        lng,
        label: note || address,
        kind: 'store',
        category: category || 'other',
      },
    ],
    [lat, lng, note, address, category]
  );

  return (
    <View style={styles.section}>
      <Text style={styles.title}>판매 위치</Text>
      <View style={styles.map}>
        <NaverMap
          lat={lat}
          lng={lng}
          zoom={15}
          lockCenter
          markers={markers}
          style={styles.mapView}
        />
        <Pressable style={styles.hit} onPress={onPress}>
          <View style={styles.overlay}>
            <Text style={styles.place} numberOfLines={1}>
              {note || address}
            </Text>
            <Text style={styles.cta}>지도 보기</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  map: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.mapPlaceholder,
  },
  mapView: {
    ...StyleSheet.absoluteFill,
  },
  hit: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  overlay: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  place: {
    flex: 1,
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 14,
  },
  cta: {
    ...typography.status,
    color: colors.accent,
  },
});
