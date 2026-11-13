import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';
import {
  getNavOptions,
  openNavigation,
  type NavDestination,
} from '../services/navigation';

interface Props {
  visible: boolean;
  destination: NavDestination | null;
  onClose: () => void;
}

export function NavigationSheet({ visible, destination, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>길찾기 앱 선택</Text>
          {getNavOptions().map((opt) => (
            <Pressable
              key={opt.key}
              style={styles.option}
              onPress={async () => {
                if (!destination) return;
                await openNavigation(opt.key, destination);
                onClose();
              }}
            >
              <Text style={styles.optionText}>{opt.label}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  option: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  optionText: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 15,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 15,
  },
});
