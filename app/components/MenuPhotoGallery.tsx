import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { foodTruckIcon } from '../constants/images';
import {
  androidFont,
  colors,
  fonts,
  layout,
  spacing,
} from '../constants/theme';

const MAX_PREVIEW = 3;

interface Props {
  /** 미리보기용 URL (최대 3장 표시) */
  urls: (string | null | undefined)[];
  /** 사진이 하나도 없을 때 아이콘 슬롯 표시 */
  showPlaceholdersWhenEmpty?: boolean;
  /** 미리보기 클릭 — index는 미리보기 슬롯 기준 */
  onPressPhoto?: (previewIndex: number, url: string | null) => void;
}

/** 상세 페이지 메뉴 사진 미리보기 — 최대 3장 */
export function MenuPhotoGallery({
  urls,
  showPlaceholdersWhenEmpty = true,
  onPressPhoto,
}: Props) {
  const photos = urls.filter((u): u is string => Boolean(u)).slice(0, MAX_PREVIEW);

  const slots: (string | null)[] =
    photos.length > 0
      ? [
          ...photos,
          ...Array.from({ length: MAX_PREVIEW - photos.length }, () => null),
        ].slice(0, MAX_PREVIEW)
      : showPlaceholdersWhenEmpty
        ? [null, null, null]
        : [];

  if (slots.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>메뉴 사진</Text>
      <View style={styles.row}>
        {slots.map((url, index) => (
          <Pressable
            key={`menu-photo-${index}`}
            style={styles.slot}
            onPress={() => onPressPhoto?.(index, url)}
            disabled={!onPressPhoto}
          >
            <Image
              source={url ? { uri: url } : foodTruckIcon}
              style={[styles.image, !url && styles.placeholder]}
              resizeMode={url ? 'cover' : 'contain'}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.sm,
    ...androidFont,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  slot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF3E8',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    padding: 10,
  },
});
