import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing, typography } from '../constants/theme';

interface Props {
  address: string;
  note?: string | null;
  onPress: () => void;
}

export function StoreMap({ address, note, onPress }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>판매 위치</Text>
      <Pressable style={styles.map} onPress={onPress}>
        <Ionicons name="location-sharp" size={28} color={colors.textSecondary} />
        <Text style={styles.place} numberOfLines={2}>
          {note || address}
        </Text>
        {note ? (
          <Text style={styles.address} numberOfLines={1}>
            {address}
          </Text>
        ) : null}
      </Pressable>
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
  map: {
    height: 160,
    borderRadius: 12,
    backgroundColor: colors.mapPlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
  },
  place: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 15,
    textAlign: 'center',
  },
  address: {
    ...typography.caption,
    textAlign: 'center',
  },
});
