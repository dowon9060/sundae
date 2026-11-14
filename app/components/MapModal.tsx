import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, layout, spacing, typography } from '../constants/theme';
import { openNaverMapPlace } from '../services/navigation';
import { OsmMap } from './OsmMap';

interface Props {
  visible: boolean;
  address: string;
  note?: string | null;
  lat: number;
  lng: number;
  name?: string;
  onClose: () => void;
}

export function MapModal({
  visible,
  address,
  note,
  lat,
  lng,
  name,
  onClose,
}: Props) {
  const title = name || note || address;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>판매 위치</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>닫기</Text>
          </Pressable>
        </View>

        <View style={styles.mapWrap}>
          {visible ? <OsmMap lat={lat} lng={lng} zoom={16} /> : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.place}>{note || address}</Text>
          {note ? <Text style={styles.address}>{address}</Text> : null}
          <Pressable
            style={styles.naverBtn}
            onPress={() =>
              void openNaverMapPlace({
                name: title,
                lat,
                lng,
              })
            }
          >
            <Text style={styles.naverBtnText}>네이버 지도에서 보기</Text>
          </Pressable>
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
    paddingHorizontal: layout.screenPadding,
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
  mapWrap: {
    flex: 1,
    marginHorizontal: layout.screenPadding,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 240,
  },
  footer: {
    padding: layout.screenPadding,
    gap: spacing.sm,
  },
  place: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 16,
  },
  address: {
    ...typography.caption,
  },
  naverBtn: {
    marginTop: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.text,
    paddingVertical: 14,
    alignItems: 'center',
  },
  naverBtnText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 15,
  },
});
