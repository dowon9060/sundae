import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

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
  return (
    <View style={styles.container}>
      <Pressable style={styles.left} onPress={onPressAddress}>
        <Text style={styles.label}>현재 설정된 위치</Text>
        <View style={styles.addressRow}>
          <Ionicons name="location-sharp" size={16} color={colors.text} />
          <Text style={styles.address} numberOfLines={1}>
            {address}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </View>
      </Pressable>
      <Pressable style={styles.gpsButton} onPress={onPressGps} hitSlop={8}>
        <Ionicons name="locate-outline" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
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
    ...typography.title,
    flexShrink: 1,
  },
  gpsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
