import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { colors, fonts, spacing } from '../constants/theme';
import {
  REPORT_REASONS,
  type ReportReason,
} from '../constants/report';
import { submitStoreReport } from '../services/api';

interface Props {
  visible: boolean;
  storeId: string;
  storeName: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function ReportSheet({
  visible,
  storeId,
  storeName,
  onClose,
  onSubmitted,
}: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setReason(null);
    setMemo('');
    setError(null);
    setDoneMessage(null);
    setSubmitting(false);
  }, [visible, storeId]);

  const onSubmit = async () => {
    if (!reason) {
      setError('어떤 정보가 다른지 골라 주세요.');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const result = await submitStoreReport(storeId, {
        reason,
        memo: memo.trim() || null,
      });
      setDoneMessage(result.message);
      onSubmitted?.();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : '제보를 보내지 못했어요. 잠시 후 다시 시도해 주세요.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.avoid}
        >
          <Pressable
            style={styles.sheet}
            onPress={(e) => e.stopPropagation()}
          >
            {doneMessage ? (
              <View style={styles.doneWrap}>
                <Text style={styles.title}>제보 완료</Text>
                <Text style={styles.doneText}>{doneMessage}</Text>
                <Pressable style={styles.primaryButton} onPress={onClose}>
                  <Text style={styles.primaryButtonText}>닫기</Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.title}>정보 제보</Text>
                <Text style={styles.subtitle}>
                  {storeName} 정보가 다르면 알려 주세요. 확인 후 반영할게요.
                </Text>

                <Text style={styles.sectionLabel}>어떤 내용인가요?</Text>
                <View style={styles.reasons}>
                  {REPORT_REASONS.map((item) => {
                    const active = reason === item.value;
                    return (
                      <Pressable
                        key={item.value}
                        style={[styles.reason, active && styles.reasonActive]}
                        onPress={() => {
                          setReason(item.value);
                          setError(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.reasonText,
                            active && styles.reasonTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.sectionLabel}>메모 (선택)</Text>
                <TextInput
                  style={styles.memo}
                  placeholder="예: 지금은 역삼역 3번 출구 쪽으로 옮겼어요"
                  placeholderTextColor={colors.textMuted}
                  value={memo}
                  onChangeText={setMemo}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable
                  style={[
                    styles.primaryButton,
                    (!reason || submitting) && styles.primaryButtonDisabled,
                  ]}
                  onPress={() => {
                    void onSubmit();
                  }}
                  disabled={!reason || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text style={styles.primaryButtonText}>제보 보내기</Text>
                  )}
                </Pressable>

                <Pressable style={styles.cancel} onPress={onClose}>
                  <Text style={styles.cancelText}>닫기</Text>
                </Pressable>
              </ScrollView>
            )}
          </Pressable>
        </KeyboardAvoidingView>
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
  avoid: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '88%',
  },
  title: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 18,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  reasons: {
    gap: spacing.sm,
  },
  reason: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reasonActive: {
    borderColor: colors.accent,
    backgroundColor: '#EAF8EE',
  },
  reasonText: {
    fontFamily: fonts.regular,
    color: colors.text,
    fontSize: 15,
  },
  reasonTextActive: {
    fontFamily: fonts.bold,
  },
  memo: {
    minHeight: 96,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    color: colors.text,
    fontFamily: fonts.regular,
    padding: spacing.md,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  error: {
    fontFamily: fonts.regular,
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 16,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelText: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 15,
  },
  doneWrap: {
    paddingVertical: spacing.sm,
  },
  doneText: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
});
