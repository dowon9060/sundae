import { Ionicons } from '@expo/vector-icons';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, layout, typography } from '../constants/theme';
import {
  businessStatusLabel,
  formatDistance,
  type NearbyStore,
} from '../types/store';

interface Props {
  store: NearbyStore;
  onPress: () => void;
}

export function StoreCard({ store, onPress }: Props) {
  const statusLabel = businessStatusLabel(store.business_status);
  const statusColor =
    store.business_status === 'confirmed_open'
      ? colors.accent
      : store.business_status === 'expected'
        ? colors.accentMuted
        : colors.textMuted;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.thumbWrap}>
        {store.photo_url ? (
          <Image source={{ uri: store.photo_url }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {store.name}
        </Text>
        {store.menu_summary ? (
          <Text style={styles.menu} numberOfLines={1}>
            {store.menu_summary}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Ionicons
            name="location-sharp"
            size={12}
            color={colors.textSecondary}
          />
          <Text style={styles.meta} numberOfLines={1}>
            {store.location_note || store.address} ·{' '}
            {formatDistance(store.distance_m)}
          </Text>
        </View>
        {store.today_hours_label ? (
          <Text style={styles.hours}>{store.today_hours_label}</Text>
        ) : null}
        <Text style={[styles.status, { color: statusColor }]}>
          {statusLabel}
          {store.location_stale ? ' · 위치 정보 오래됨' : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
    marginHorizontal: layout.screenPadding,
    marginBottom: layout.cardGap,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  thumbWrap: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: layout.thumbRadius,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {},
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    paddingLeft: 16,
    paddingRight: 4,
  },
  name: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 16,
  },
  menu: {
    ...typography.caption,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  meta: {
    ...typography.caption,
    flexShrink: 1,
  },
  hours: {
    ...typography.caption,
  },
  status: {
    ...typography.status,
    marginTop: 2,
  },
});
