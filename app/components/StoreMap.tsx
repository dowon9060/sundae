import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, layout, spacing, typography } from '../constants/theme';
import { OsmMap } from './OsmMap';

interface Props {
  address: string;
  note?: string | null;
  lat: number;
  lng: number;
  onPress: () => void;
}

export function StoreMap({ address, note, lat, lng, onPress }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>판매 위치</Text>
      <View style={styles.map}>
        <OsmMap lat={lat} lng={lng} zoom={15} style={styles.mapView} />
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
    ...StyleSheet.absoluteFillObject,
  },
  hit: {
    ...StyleSheet.absoluteFillObject,
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
