/** 화이트 배경 + 목업 구조에 맞춘 라이트 팔레트 */
export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F4F4F5',
  border: '#E6E6E8',
  text: '#111111',
  textSecondary: '#8A8A8E',
  textMuted: '#A0A0A5',
  accent: '#2FBF5B',
  accentMuted: '#5AAF6E',
  danger: '#E14C4C',
  chip: '#F4F4F5',
  chipActive: '#FFFFFF',
  chipBorder: '#D8D8DC',
  chipBorderActive: '#111111',
  mapPlaceholder: '#F0F0F2',
  overlay: 'rgba(0,0,0,0.4)',
  shadow: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/** 목업 기준 카드·썸네일 크기 */
export const layout = {
  screenPadding: 16,
  cardRadius: 16,
  cardPadding: 12,
  cardGap: 10,
  /** 카드 가로의 약 절반 */
  thumbSize: 152,
  thumbRadius: 14,
  chipRadius: 22,
  chipHeight: 40,
};

export const fonts = {
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  bold: 'NotoSansKR_700Bold',
};

export const typography = {
  hero: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  bodyMedium: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  status: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
};
