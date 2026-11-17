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
import { colors, fonts, layout, spacing } from '../constants/theme';
import { submitStoreRegistration } from '../services/api';
import { CATEGORY_LABELS, type StoreCategory } from '../types/store';

type PhotoKey = 'menu' | 'location' | 'truck';
type CategoryKey = Exclude<StoreCategory, 'all'>;

interface PhotoState {
  uri: string;
  dataUrl: string;
}

interface Props {
  visible: boolean;
  defaultLat?: number;
  defaultLng?: number;
  onClose: () => void;
}

const PHOTO_LABELS: Record<PhotoKey, string> = {
  menu: '메뉴',
  location: '위치',
  truck: '푸드트럭',
};

const CATEGORY_KEYS: CategoryKey[] = [
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

/** 월~일 순서 */
const WEEK_DAYS: { key: number; label: string }[] = [
  { key: 1, label: '월' },
  { key: 2, label: '화' },
  { key: 3, label: '수' },
  { key: 4, label: '목' },
  { key: 5, label: '금' },
  { key: 6, label: '토' },
  { key: 0, label: '일' },
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

function buildTodayHours(days: number[], timeText: string): string {
  const dayPart = WEEK_DAYS.filter((d) => days.includes(d.key))
    .map((d) => d.label)
    .join(' ');
  const timePart = timeText.trim();
  if (dayPart && timePart) return `${dayPart} ${timePart}`;
  return dayPart || timePart;
}

export function RegisterStoreSheet({
  visible,
  defaultLat,
  defaultLng,
  onClose,
}: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [menu, setMenu] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeText, setTimeText] = useState('');
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
    setCategory(null);
    setMenu('');
    setSelectedDays([]);
    setTimeText('');
    setLocationText('');
    setPhotos({});
    setSubmitting(false);
    setError(null);
    setDoneMessage(null);
  }, [visible]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

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
    Alert.alert(`${PHOTO_LABELS[key]} 사진 첨부`, '첨부 방법을 선택해 주세요.', [
      { text: '앨범', onPress: () => void pickPhoto(key) },
      { text: '촬영', onPress: () => void takePhoto(key) },
      ...(photos[key]
        ? [
            {
              text: '삭제',
              style: 'destructive' as const,
              onPress: () =>
                setPhotos((prev) => {
                  const next = { ...prev };
                  delete next[key];
                  return next;
                }),
            },
          ]
        : []),
      { text: '취소', style: 'cancel' },
    ]);
  };

  const onSubmit = async () => {
    if (submitting) return;

    const todayHours = buildTodayHours(selectedDays, timeText);
    const hasAnything =
      Boolean(name.trim()) ||
      category != null ||
      Boolean(menu.trim()) ||
      Boolean(todayHours) ||
      Boolean(locationText.trim()) ||
      Boolean(photos.menu || photos.location || photos.truck);

    if (!hasAnything) {
      setError('내용을 하나 이상 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await submitStoreRegistration({
        name: name.trim(),
        category: category ?? null,
        menu: menu.trim(),
        today_hours: todayHours,
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
                        style={[
                          styles.categoryChip,
                          active && styles.categoryChipActive,
                        ]}
                        onPress={() =>
                          setCategory((prev) => (prev === key ? null : key))
                        }
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
                  style={styles.input}
                  value={menu}
                  onChangeText={setMenu}
                  placeholder="예: 순대 6000원"
                  placeholderTextColor={colors.textMuted}
                />
              </Field>

              <Field label="운영 요일">
                <View style={styles.dayRow}>
                  {WEEK_DAYS.map((d) => {
                    const active = selectedDays.includes(d.key);
                    return (
                      <Pressable
                        key={d.key}
                        style={[styles.dayChip, active && styles.dayChipActive]}
                        onPress={() => toggleDay(d.key)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: active }}
                        accessibilityLabel={d.label}
                      >
                        <Text
                          style={[
                            styles.dayChipText,
                            active && styles.dayChipTextActive,
                          ]}
                        >
                          {d.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>

              <Field label="시간">
                <TextInput
                  style={styles.input}
                  value={timeText}
                  onChangeText={setTimeText}
                  placeholder="예: 18시 있음"
                  placeholderTextColor={colors.textMuted}
                />
              </Field>

              <Field label="위치">
                <TextInput
                  style={styles.input}
                  value={locationText}
                  onChangeText={setLocationText}
                  placeholder="예: 강남역 2번 출구 앞"
                  placeholderTextColor={colors.textMuted}
                />
              </Field>

              <Text style={styles.photoSection}>사진 첨부</Text>
              {(Object.keys(PHOTO_LABELS) as PhotoKey[]).map((key) => (
                <View key={key} style={styles.photoRow}>
                  <Text style={styles.photoLabel}>{PHOTO_LABELS[key]}</Text>
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
                      {photos[key] ? '다시 첨부' : '첨부'}
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
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.chip,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryChipActive: {
    borderColor: colors.chipBorderActive,
    backgroundColor: colors.chipActive,
  },
  categoryChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.text,
    fontFamily: fonts.bold,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  dayChipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  dayChipTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
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
  photoLabel: {
    width: 64,
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 14,
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
    marginLeft: 'auto',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
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
