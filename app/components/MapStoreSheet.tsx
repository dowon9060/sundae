import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveStoreImageSource } from '../constants/images';
import { colors, fonts, layout, spacing, typography } from '../constants/theme';
import {
  businessStatusLabel,
  formatDistance,
  type NearbyStore,
} from '../types/store';

interface Props {
  store: NearbyStore | null;
  onClose: () => void;
  onPressDetail: (storeId: string) => void;
}

/** 지도 마커 선택 시 하단 바텀시트 */
export function MapStoreSheet({ store, onClose, onPressDetail }: Props) {
  const insets = useSafeAreaInsets();

  if (!store) return null;

  const statusLabel = businessStatusLabel(store.business_status);
  const closed = Boolean(store.is_closed_on_day);

  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
      pointerEvents="box-none"
    >
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Pressable style={styles.closeHit} onPress={onClose} hitSlop={8}>
          <Text style={styles.closeText}>닫기</Text>
        </Pressable>

        <Pressable
          style={styles.row}
          onPress={() => onPressDetail(store.id)}
        >
          {(() => {
            const { source, isPhoto } = resolveStoreImageSource(
              store.photo_url,
              store.category
            );
            return (
              <Image
                source={source}
                style={[styles.thumb, !isPhoto && styles.thumbPlaceholder]}
                resizeMode={isPhoto ? 'cover' : 'contain'}
              />
            );
          })()}
          <View style={styles.body}>
            <Text
              style={[styles.name, closed && styles.muted]}
              numberOfLines={1}
            >
              {store.name}
            </Text>
            {store.menu_summary ? (
              <Text
                style={[styles.menu, closed && styles.muted]}
                numberOfLines={2}
              >
                {store.menu_summary}
              </Text>
            ) : null}
            <Text style={styles.meta} numberOfLines={2}>
              {store.location_note || store.address}
              {store.distance_m != null
                ? ` · ${formatDistance(store.distance_m)}`
                : ''}
            </Text>
            {store.today_hours_label ? (
              <Text style={[styles.hours, closed && styles.muted]}>
                {store.today_hours_label}
              </Text>
            ) : null}
            <Text style={styles.status}>{statusLabel}</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.detailBtn}
          onPress={() => onPressDetail(store.id)}
        >
          <Text style={styles.detailBtnText}>상세 보기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheet: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  closeHit: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 2,
  },
  closeText: {
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
  },
  thumbPlaceholder: {
    backgroundColor: '#FFF3E8',
    padding: 8,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    paddingRight: 36,
  },
  name: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 17,
  },
  menu: {
    ...typography.caption,
  },
  meta: {
    ...typography.caption,
  },
  hours: {
    ...typography.caption,
  },
  status: {
    ...typography.status,
    color: colors.accent,
    marginTop: 2,
  },
  muted: {
    color: colors.textMuted,
  },
  detailBtn: {
    marginTop: spacing.md,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBtnText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 15,
  },
});
