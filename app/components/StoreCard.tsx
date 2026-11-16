import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { foodTruckIcon, resolveStorePhotoUrl } from '../constants/images';
import {
  androidFont,
  colors,
  fontLine,
  fonts,
  layout,
  typography,
} from '../constants/theme';
import { toggleStoreLike } from '../services/api';
import {
  businessStatusLabel,
  formatDistance,
  type NearbyStore,
} from '../types/store';

interface Props {
  store: NearbyStore;
  onPress: () => void;
  onLikeChange?: (storeId: string, liked: boolean, likeCount: number) => void;
}

export function StoreCard({ store, onPress, onLikeChange }: Props) {
  const statusLabel = businessStatusLabel(store.business_status);
  const statusColor =
    store.business_status === 'confirmed_open'
      ? colors.accent
      : store.business_status === 'expected'
        ? colors.accentMuted
        : colors.textMuted;

  const closed = Boolean(store.is_closed_on_day);
  const [liked, setLiked] = useState(Boolean(store.liked));
  const [likeCount, setLikeCount] = useState(Number(store.like_count ?? 0));
  const [liking, setLiking] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);

  useEffect(() => {
    setLiked(Boolean(store.liked));
    setLikeCount(Number(store.like_count ?? 0));
  }, [store.id, store.liked, store.like_count]);

  const onPressLike = async () => {
    if (liking) return;
    setLiking(true);
    setLikeError(null);

    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikeCount(nextCount);

    try {
      const result = await toggleStoreLike(store.id);
      setLiked(result.liked);
      setLikeCount(result.like_count);
      onLikeChange?.(store.id, result.liked, result.like_count);
    } catch (e) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      setLikeError(
        e instanceof Error
          ? e.message
          : '좋아요를 반영하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
    } finally {
      setLiking(false);
    }
  };

  return (
    <Pressable
      style={[styles.card, closed && styles.cardClosed]}
      onPress={onPress}
    >
      <View style={styles.thumbWrap}>
        {(() => {
          const photo = resolveStorePhotoUrl(store.photo_url);
          return (
            <Image
              source={photo ? { uri: photo } : foodTruckIcon}
              style={[styles.thumb, !photo && styles.thumbPlaceholder]}
              resizeMode={photo ? 'cover' : 'contain'}
            />
          );
        })()}
      </View>
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, closed && styles.textMuted]}
            numberOfLines={1}
          >
            {store.name}
          </Text>
          <Pressable
            style={styles.likeBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              void onPressLike();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={liked ? '좋아요 취소' : '좋아요'}
          >
            {liking ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={20}
                color={liked ? colors.danger : colors.textSecondary}
              />
            )}
            <Text style={[styles.likeCount, liked && styles.likeCountActive]}>
              {likeCount}
            </Text>
          </Pressable>
        </View>
        {likeError ? (
          <Text style={styles.likeError} numberOfLines={1}>
            {likeError}
          </Text>
        ) : null}
        {store.menu_summary ? (
          <Text style={[styles.menu, closed && styles.textMuted]} numberOfLines={1}>
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
          <Text style={[styles.hours, closed && styles.hoursClosed]}>
            {store.today_hours_label}
          </Text>
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
  thumbPlaceholder: {
    backgroundColor: '#FFF3E8',
    padding: 8,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    paddingLeft: 16,
    paddingRight: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 16,
    lineHeight: fontLine(16),
    ...androidFont,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minWidth: 40,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  likeCount: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: fontLine(13),
    color: colors.textSecondary,
    minWidth: 12,
    ...androidFont,
  },
  likeCountActive: {
    color: colors.danger,
  },
  likeError: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: fontLine(11),
    color: colors.danger,
    ...androidFont,
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
  hoursClosed: {
    color: colors.textMuted,
  },
  cardClosed: {
    opacity: 0.72,
  },
  textMuted: {
    color: colors.textMuted,
  },
  status: {
    ...typography.status,
    marginTop: 2,
  },
});
