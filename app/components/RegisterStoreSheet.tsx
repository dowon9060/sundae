import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, layout, spacing, typography } from '../constants/theme';
import { submitStoreRegistration } from '../services/api';
import { CATEGORY_LABELS, type StoreCategory } from '../types/store';

type PhotoKey = 'menu' | 'location' | 'truck';

interface PhotoState {
  uri: string;
  dataUrl: string;
}

interface Props {
  visible: boolean;
  defaultLocation?: string;
  defaultLat?: number;
  defaultLng?: number;
  onClose: () => void;
}

const PHOTO_LABELS: Record<PhotoKey, string> = {
  menu: '메뉴',
  location: '위치캡쳐',
  truck: '푸드트럭',
};

const CATEGORY_KEYS: Exclude<StoreCategory, 'all'>[] = [
  'sundae',
  'bungeoppang',
  'dakkochi',
  'mandu',
  'takoyaki',
  'chicken',
  'gopchang',
  'hotteok',
  'hoe',
  'other',
];

async function toCompressedDataUrl(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 960 } }],
    { compress: 0.55, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  if (!manipulated.base64) {
    throw new Error('사진을 준비하지 못했습니다. 다시 첨부해 주세요.');
  }
  return `data:image/jpeg;base64,${manipulated.base64}`;
}

export function RegisterStoreSheet({
  visible,
  defaultLocation = '',
  defaultLat,
  defaultLng,
  onClose,
}: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] =
    useState<Exclude<StoreCategory, 'all'>>('sundae');
  const [menu, setMenu] = useState('');
  const [todayHours, setTodayHours] = useState('');
  const [locationText, setLocationText] = useState('');
  const [photos, setPhotos] = useState<Partial<Record<PhotoKey, PhotoState>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName('');
    setCategory('sundae');
    setMenu('');
    setTodayHours('');
    setLocationText(defaultLocation);
    setPhotos({});
    setSubmitting(false);
    setError(null);
    setDoneMessage(null);
  }, [visible, defaultLocation]);

  const pickPhoto = async (key: PhotoKey) => {
    setError(null);
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('사진 접근 권한이 필요합니다. 설정에서 허용해 주세요.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.canceled || !result.assets[0]?.uri) return;

      const dataUrl = await toCompressedDataUrl(result.assets[0].uri);
      setPhotos((prev) => ({
        ...prev,
        [key]: { uri: result.assets[0].uri, dataUrl },
      }));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : '사진을 첨부하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
    }
  };

  const takePhoto = async (key: PhotoKey) => {
    setError(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError('카메라 권한이 필요합니다. 설정에서 허용해 주세요.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.canceled || !result.assets[0]?.uri) return;

      const dataUrl = await toCompressedDataUrl(result.assets[0].uri);
      setPhotos((prev) => ({
        ...prev,
        [key]: { uri: result.assets[0].uri, dataUrl },
      }));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : '사진을 촬영하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
    }
  };

  const choosePhotoSource = (key: PhotoKey) => {
    Alert.alert(PHOTO_LABELS[key] + ' 사진', '첨부 방법을 선택해 주세요.', [
      { text: '앨범', onPress: () => void pickPhoto(key) },
      { text: '촬영', onPress: () => void takePhoto(key) },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const onSubmit = async () => {
    if (submitting) return;

    if (!name.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    if (!category) {
      setError('카테고리를 선택해 주세요.');
      return;
    }
    if (!menu.trim()) {
      setError('메뉴를 입력해 주세요.');
      return;
    }
    if (!todayHours.trim()) {
      setError('오늘 운영 시간을 입력해 주세요.');
      return;
    }
    if (!locationText.trim()) {
      setError('위치를 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await submitStoreRegistration({
        name: name.trim(),
        category,
        menu: menu.trim(),
        today_hours: todayHours.trim(),
        location_text: locationText.trim(),
        lat: defaultLat ?? null,
        lng: defaultLng ?? null,
        photo_menu: photos.menu?.dataUrl ?? null,
        photo_location: photos.location?.dataUrl ?? null,
        photo_truck: photos.truck?.dataUrl ?? null,
      });
      setDoneMessage(result.message);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : '등록 요청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>순대차 등록 요청</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>닫기</Text>
          </Pressable>
        </View>

        {doneMessage ? (
          <View style={styles.doneWrap}>
            <Text style={styles.doneText}>{doneMessage}</Text>
            <Pressable style={styles.submitBtn} onPress={onClose}>
              <Text style={styles.submitText}>확인</Text>
            </Pressable>
          </View>
        ) : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
            >
              <Field label="이름">
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="예: 역삼 순대차"
                  placeholderTextColor={colors.textMuted}
                />
              </Field>

              <Field label="카테고리">
                <View style={styles.categoryRow}>
                  {CATEGORY_KEYS.map((key) => {
                    const active = category === key;
                    return (
                      <Pressable
                        key={key}
                        style={[styles.categoryChip, active && styles.categoryChipActive]}
                        onPress={() => setCategory(key)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            active && styles.categoryChipTextActive,
                          ]}
                        >
                          {CATEGORY_LABELS[key]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>

              <Field label="메뉴">
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={menu}
                  onChangeText={setMenu}
                  placeholder="예: 순대 5000 · 순대국 7000"
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
              </Field>

              <Field label="오늘날">
                <TextInput
                  style={styles.input}
                  value={todayHours}
                  onChangeText={setTodayHours}
                  placeholder="예: 11:00~20:00"
                  placeholderTextColor={colors.textMuted}
                />
              </Field>

              <Field label="위치">
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={locationText}
                  onChangeText={setLocationText}
                  placeholder="판매 위치를 입력해 주세요"
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
              </Field>

              <Text style={styles.photoSection}>사진첨부</Text>
              {(Object.keys(PHOTO_LABELS) as PhotoKey[]).map((key) => (
                <View key={key} style={styles.photoRow}>
                  <View style={styles.photoMeta}>
                    <Text style={styles.photoLabel}>{PHOTO_LABELS[key]}</Text>
                    <Text style={styles.photoHint}>
                      {photos[key] ? '첨부됨' : '선택'}
                    </Text>
                  </View>
                  {photos[key] ? (
                    <Image
                      source={{ uri: photos[key]!.uri }}
                      style={styles.thumb}
                    />
                  ) : (
                    <View style={[styles.thumb, styles.thumbEmpty]} />
                  )}
                  <Pressable
                    style={styles.attachBtn}
                    onPress={() => choosePhotoSource(key)}
                  >
                    <Text style={styles.attachText}>
                      {photos[key] ? '다시 선택' : '첨부'}
                    </Text>
                  </Pressable>
                </View>
              ))}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.submitBtn, submitting && styles.submitDisabled]}
                disabled={submitting}
                onPress={() => {
                  void onSubmit();
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>등록 요청</Text>
                )}
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
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
  form: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  photoSection: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  photoMeta: {
    flex: 1,
    gap: 2,
  },
  photoLabel: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 14,
  },
  photoHint: {
    ...typography.caption,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
  },
  thumbEmpty: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  attachText: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 13,
  },
  error: {
    fontFamily: fonts.regular,
    color: colors.danger,
    fontSize: 13,
  },
  submitBtn: {
    marginTop: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.text,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 16,
  },
  doneWrap: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  doneText: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
