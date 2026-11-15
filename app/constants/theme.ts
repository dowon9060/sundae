import { Platform, type TextStyle } from 'react-native';

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
  /** Noto Sans KR + Android 여유 (폴드 배율 포함) */
  chipHeight: 44,
  dayChipHeight: 40,
};

export const fonts = {
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  bold: 'NotoSansKR_700Bold',
};

/**
 * Android(폴드 포함)에서 Noto Sans KR 세로 잘림 방지.
 * includeFontPadding 제거 + lineHeight 명시.
 */
export const androidFont: TextStyle = Platform.select({
  android: {
    includeFontPadding: false,
    textAlignVertical: 'center' as const,
  },
  default: {},
})!;

export function fontLine(size: number): number {
  return Math.round(size * 1.5);
}

function typeStyle(
  family: string,
  size: number,
  color: string,
  extra?: TextStyle
): TextStyle {
  return {
    fontFamily: family,
    fontSize: size,
    lineHeight: fontLine(size),
    color,
    ...androidFont,
    ...extra,
  };
}

export const typography = {
  hero: typeStyle(fonts.bold, 24, colors.text),
  title: typeStyle(fonts.bold, 18, colors.text),
  subtitle: typeStyle(fonts.bold, 16, colors.text),
  body: typeStyle(fonts.regular, 15, colors.text),
  bodyMedium: typeStyle(fonts.medium, 15, colors.text),
  caption: typeStyle(fonts.regular, 13, colors.textSecondary),
  label: typeStyle(fonts.regular, 12, colors.textSecondary),
  status: typeStyle(fonts.medium, 13, colors.text),
  chip: typeStyle(fonts.medium, 14, colors.textSecondary),
  chipBold: typeStyle(fonts.bold, 14, colors.text),
  dayChip: typeStyle(fonts.medium, 13, colors.textSecondary),
  dayChipBold: typeStyle(fonts.bold, 13, colors.text),
  micro: typeStyle(fonts.medium, 11, colors.text),
};
