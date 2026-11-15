import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, layout, spacing, typography } from '../constants/theme';
import { localizeAddressText } from '../services/koreanAddress';

interface Props {
  address: string;
  onPressAddress: () => void;
  onPressGps: () => void;
}

export function LocationHeader({
  address,
  onPressAddress,
  onPressGps,
}: Props) {
  const displayAddress = localizeAddressText(address);

  return (
    <View style={styles.container}>
      <Pressable style={styles.left} onPress={onPressAddress}>
        <Text style={styles.label}>현재 설정된 위치</Text>
        <View style={styles.addressRow}>
          <Ionicons name="location-sharp" size={16} color={colors.text} />
          <Text style={styles.address} numberOfLines={1}>
            {displayAddress}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.textSecondary}
          />
        </View>
      </Pressable>
      <Pressable
        style={styles.gpsButton}
        onPress={onPressGps}
        hitSlop={8}
        accessibilityLabel="현위치"
      >
        <Ionicons name="locate-outline" size={18} color={colors.text} />
        <Text style={styles.gpsLabel}>현위치</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  left: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    flexShrink: 1,
  },
  gpsButton: {
    minWidth: 52,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 6,
  },
  gpsLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
  },
});
