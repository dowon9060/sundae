import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';
import type { MenuItem } from '../types/store';

interface Props {
  menus: MenuItem[];
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

export function MenuList({ menus }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>판매 메뉴</Text>
      {menus.length === 0 ? (
        <Text style={styles.empty}>등록된 메뉴가 없습니다.</Text>
      ) : (
        menus.map((menu) => (
          <View key={menu.id} style={styles.row}>
            <Text
              style={[styles.name, !menu.is_available && styles.unavailable]}
            >
              {menu.name}
              {!menu.is_available ? ' (판매 중지)' : ''}
            </Text>
            <Text style={styles.price}>{formatPrice(menu.price)}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  name: {
    fontFamily: fonts.regular,
    color: colors.text,
    fontSize: 15,
  },
  unavailable: {
    color: colors.textMuted,
  },
  price: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 15,
  },
  empty: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
});
