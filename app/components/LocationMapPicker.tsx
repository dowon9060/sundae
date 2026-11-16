import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  androidFont,
  colors,
  fonts,
  layout,
  spacing,
  typography,
} from '../constants/theme';
import { reverseGeocodeAddress } from '../services/location';
import { openNaverMapPlace } from '../services/navigation';
import { NaverMap } from './NaverMap';

interface Props {
  visible: boolean;
  initialLat: number;
  initialLng: number;
  onClose: () => void;
  onConfirm: (lat: number, lng: number, address: string) => void;
}

export function LocationMapPicker({
  visible,
  initialLat,
  initialLng,
  onClose,
  onConfirm,
}: Props) {
  const [coord, setCoord] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState('주소를 확인하는 중...');
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setCoord({ lat: initialLat, lng: initialLng });
  }, [visible, initialLat, initialLng]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setResolving(true);
    void (async () => {
      const label = await reverseGeocodeAddress(coord.lat, coord.lng);
      if (!cancelled) {
        setAddress(label);
        setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, coord.lat, coord.lng]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>지도에서 위치 선택</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>닫기</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>
          지도를 움직이면 중앙 핀 위치가 선택됩니다. 멈춘 뒤 주소를 확인하세요.
        </Text>

        <View style={styles.mapWrap}>
          {visible ? (
            <NaverMap
              key={`pick-${initialLat.toFixed(5)}-${initialLng.toFixed(5)}`}
              lat={initialLat}
              lng={initialLng}
              zoom={16}
              centerPin
              lockCenter
              onPick={(lat, lng) => setCoord({ lat, lng })}
            />
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.address} numberOfLines={2}>
            {resolving ? '주소를 확인하는 중...' : address}
          </Text>
          <Pressable
            style={styles.naverBtn}
            onPress={() =>
              void openNaverMapPlace({
                name: address,
                lat: coord.lat,
                lng: coord.lng,
              })
            }
          >
            <Text style={styles.naverBtnText}>네이버 지도에서 보기</Text>
          </Pressable>
          <Pressable
            style={[
              styles.confirmBtn,
              (resolving || saving) && styles.confirmDisabled,
            ]}
            disabled={resolving || saving}
            onPress={() => {
              void (async () => {
                setSaving(true);
                try {
                  const label = resolving
                    ? await reverseGeocodeAddress(coord.lat, coord.lng)
                    : address;
                  onConfirm(coord.lat, coord.lng, label);
                } finally {
                  setSaving(false);
                }
              })();
            }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmText}>이 위치로 설정</Text>
            )}
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
    lineHeight: 27,
    ...androidFont,
  },
  close: {
    fontFamily: fonts.medium,
    color: colors.accent,
    fontSize: 16,
    lineHeight: 24,
    ...androidFont,
  },
  hint: {
    ...typography.caption,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.sm,
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
  address: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 40,
    ...androidFont,
  },
  naverBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    alignItems: 'center',
  },
  naverBtnText: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    ...androidFont,
  },
  confirmBtn: {
    borderRadius: 12,
    backgroundColor: colors.text,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    ...androidFont,
  },
});
