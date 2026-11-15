import { Image, StyleSheet, Text, View } from 'react-native';
import { foodTruckIcon } from '../constants/images';
import { colors, fonts } from '../constants/theme';

/** 앱 실행 시 푸드트럭 로고 스플래시 */
export function AppSplash() {
  return (
    <View style={styles.wrap} accessibilityLabel="순대차 로고">
      <Image source={foodTruckIcon} style={styles.logo} resizeMode="contain" />
      <Text style={styles.brand}>순대차</Text>
      <Text style={styles.sub}>내 주변 이동식 판매점</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 168,
    height: 168,
    borderRadius: 36,
  },
  brand: {
    marginTop: 28,
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
