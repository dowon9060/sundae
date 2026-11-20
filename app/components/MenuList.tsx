import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { foodTruckIcon, resolveStorePhotoUrl } from '../constants/images';
import {
  androidFont,
  colors,
  fonts,
  layout,
  spacing,
} from '../constants/theme';
import type { MenuItem } from '../types/store';

interface Props {
  menus: MenuItem[];
  onPressPhoto?: (url: string | null) => void;
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

export function MenuList({ menus, onPressPhoto }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>판매 메뉴</Text>
      {menus.length === 0 ? (
        <Text style={styles.empty}>등록된 메뉴가 없어요.</Text>
      ) : (
        menus.map((menu) => (
          <View key={menu.id} style={styles.row}>
            {(() => {
              const photo = resolveStorePhotoUrl(menu.photo_url);
              return (
                <Pressable
                  onPress={() => onPressPhoto?.(photo)}
                  disabled={!onPressPhoto}
                >
                  <Image
                    source={photo ? { uri: photo } : foodTruckIcon}
                    style={[
                      styles.thumb,
                      !photo && styles.thumbPlaceholder,
                    ]}
                    resizeMode={photo ? 'cover' : 'contain'}
                  />
                </Pressable>
              );
            })()}
            <View style={styles.body}>
              <Text
                style={[styles.name, !menu.is_available && styles.unavailable]}
                numberOfLines={2}
              >
                {menu.name}
                {!menu.is_available ? ' (판매 중지)' : ''}
              </Text>
              <Text style={styles.price}>{formatPrice(menu.price)}</Text>
            </View>
          </View>
        ))
      )}
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
    lineHeight: 24,
    marginBottom: spacing.sm,
    ...androidFont,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
  },
  thumbPlaceholder: {
    backgroundColor: '#FFF3E8',
    padding: 8,
  },
  body: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.regular,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    ...androidFont,
  },
  unavailable: {
    color: colors.textMuted,
  },
  price: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    ...androidFont,
  },
  empty: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    ...androidFont,
  },
});
