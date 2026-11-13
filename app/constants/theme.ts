/** 목업에서 추출한 색상 */
export const colors = {
  background: '#181818',
  surface: '#2A2A2A',
  surfaceElevated: '#333333',
  border: '#3A3A3A',
  text: '#FFFFFF',
  textSecondary: '#909094',
  textMuted: '#6E6E72',
  accent: '#6BC67F',
  accentMuted: '#569B65',
  danger: '#E57373',
  chip: '#2A2A2A',
  chipActive: '#333333',
  chipBorder: '#4A4A4A',
  mapPlaceholder: '#2F2F2F',
  overlay: 'rgba(0,0,0,0.55)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
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
