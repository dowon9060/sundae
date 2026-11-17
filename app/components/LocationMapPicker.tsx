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
  title?: string;
  hint?: string;
  pinLabel?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (lat: number, lng: number, address: string) => void | Promise<void>;
}

export function LocationMapPicker({
  visible,
  initialLat,
  initialLng,
  title = '지도에서 위치 선택',
  hint = '지도를 움직이면 중앙의 내 위치가 바뀝니다. 멈춘 뒤 주소를 확인하고 설정하세요.',
  pinLabel = '내 위치',
  confirmLabel = '이 위치로 내 위치 설정',
  onClose,
  onConfirm,
}: Props) {
  const [coord, setCoord] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState('주소를 확인하는 중...');
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setCoord({ lat: initialLat, lng: initialLng });
    setError(null);
    setAddress('주소를 확인하는 중...');
  }, [visible, initialLat, initialLng]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setResolving(true);
    void (async () => {
      try {
        const label = await reverseGeocodeAddress(coord.lat, coord.lng);
        if (!cancelled) {
          setAddress(label);
          setResolving(false);
        }
      } catch (err) {
        if (!cancelled) {
          setAddress(`${coord.lat.toFixed(5)}, ${coord.lng.toFixed(5)}`);
          setResolving(false);
          if (__DEV__) {
            console.warn(
              '[LocationMapPicker] reverse geocode failed',
              err instanceof Error ? err.message : err
            );
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, coord.lat, coord.lng]);

  const applyCenter = (lat: number, lng: number) => {
    setCoord((prev) => {
      if (
        Math.abs(prev.lat - lat) < 0.00001 &&
        Math.abs(prev.lng - lng) < 0.00001
      ) {
        return prev;
      }
      return { lat, lng };
    });
  };

  const onPressConfirm = () => {
    if (saving || resolving) return;
    setSaving(true);
    setError(null);
    void (async () => {
      try {
        const label = resolving
          ? await reverseGeocodeAddress(coord.lat, coord.lng)
          : address;
        await onConfirm(coord.lat, coord.lng, label);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : '위치를 저장하지 못했습니다. 다시 시도해 주세요.'
        );
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>닫기</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>{hint}</Text>

        <View style={styles.mapWrap}>
          {visible ? (
            <NaverMap
              key={`pick-${initialLat.toFixed(5)}-${initialLng.toFixed(5)}`}
              lat={initialLat}
              lng={initialLng}
              zoom={16}
              navigable
              centerPin
              centerPinLabel={pinLabel}
              centerPinTone="user"
              lockCenter
              onPick={applyCenter}
              onCameraIdle={applyCenter}
            />
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.addressLabel}>선택한 위치</Text>
          <Text style={styles.address} numberOfLines={2}>
            {resolving ? '주소를 확인하는 중...' : address}
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
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
            onPress={onPressConfirm}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmText}>{confirmLabel}</Text>
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
  addressLabel: {
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    ...androidFont,
  },
  address: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 40,
    ...androidFont,
  },
  error: {
    fontFamily: fonts.regular,
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
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
