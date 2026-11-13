import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing, typography } from '../constants/theme';

interface Props {
  visible: boolean;
  address: string;
  note?: string | null;
  onClose: () => void;
}

export function MapModal({ visible, address, note, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>판매 위치</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>닫기</Text>
          </Pressable>
        </View>
        <View style={styles.map}>
          <Ionicons name="location-sharp" size={36} color={colors.accent} />
          <Text style={styles.place}>{note || address}</Text>
          {note ? <Text style={styles.address}>{address}</Text> : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 18,
  },
  close: {
    fontFamily: fonts.medium,
    color: colors.accent,
    fontSize: 16,
  },
  map: {
    flex: 1,
    margin: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.mapPlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: spacing.lg,
  },
  place: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
  },
  address: {
    ...typography.caption,
    textAlign: 'center',
  },
});
