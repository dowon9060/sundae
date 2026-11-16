import { Image, StyleSheet, Text, View } from 'react-native';
import { appLogo } from '../constants/images';
import { colors, fonts } from '../constants/theme';

/** 앱 실행 시 순대차 로고 스플래시 */
export function AppSplash() {
  return (
    <View style={styles.wrap} accessibilityLabel="순대차 로고">
      <View style={styles.logoGlow}>
        <Image source={appLogo} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.brand}>순대차</Text>
      <Text style={styles.sub}>내 주변 이동식 판매점</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: '#FFF9E8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoGlow: {
    width: 200,
    height: 200,
    borderRadius: 44,
    backgroundColor: '#FFF3C4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 188,
    height: 188,
  },
  brand: {
    marginTop: 24,
    fontFamily: fonts.bold,
    fontSize: 30,
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
