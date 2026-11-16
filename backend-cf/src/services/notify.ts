import type { Env, ReportReason } from '../types';

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  hours_changed: '운영 요일이 달라졌어요',
  no_longer_comes: '더 이상 이 자리에 안 와요',
  location_changed: '위치가 달라졌어요',
  price_changed: '가격이 달라졌어요',
};

export interface ReportNotifyPayload {
  reportId: string;
  storeId: string;
  storeName: string;
  reason: ReportReason;
  memo: string | null;
  createdAt: string;
}

async function postSlackWebhook(
  webhook: string,
  text: string,
  event: string
): Promise<boolean> {
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      return true;
    }
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'slack_webhook_failed',
        event,
        status: res.status,
      })
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'slack_webhook_error',
        event,
        detail: err instanceof Error ? err.message : 'unknown',
      })
    );
  }
  return false;
}

/**
 * 정보 제보(수정) 알림.
 * SLACK_WEBHOOK_REPORT_URL이 있으면 Slack으로 보낸다.
 */
export async function notifyStoreReport(
  env: Env,
  payload: ReportNotifyPayload
): Promise<{ notified: boolean; channel: 'slack' | 'log' }> {
  const reasonLabel = REPORT_REASON_LABELS[payload.reason];
  const text = [
    '[순대차 정보 제보]',
    `판매점: ${payload.storeName} (${payload.storeId})`,
    `사유: ${reasonLabel}`,
    payload.memo ? `메모: ${payload.memo}` : '메모: (없음)',
    `제보 ID: ${payload.reportId}`,
    `시각: ${payload.createdAt}`,
  ].join('\n');

  const webhook = env.SLACK_WEBHOOK_REPORT_URL?.trim();
  if (webhook && (await postSlackWebhook(webhook, text, 'store_report_notify'))) {
    return { notified: true, channel: 'slack' };
  }

  console.log(
    JSON.stringify({
      level: 'info',
      event: 'store_report_notify',
      channel: 'log',
      ...payload,
      reason_label: reasonLabel,
      text,
    })
  );

  return { notified: true, channel: 'log' };
}

export interface RegistrationNotifyPayload {
  requestId: string;
  name: string;
  category: string;
  menu: string;
  todayHours: string;
  locationText: string;
  lat: number | null;
  lng: number | null;
  hasPhotoMenu: boolean;
  hasPhotoLocation: boolean;
  hasPhotoTruck: boolean;
  createdAt: string;
}

/**
 * 순대차 등록 요청 알림.
 * SLACK_WEBHOOK_REGISTRATION_URL이 있으면 Slack으로 보낸다.
 */
export async function notifyStoreRegistration(
  env: Env,
  payload: RegistrationNotifyPayload
): Promise<{ notified: boolean; channel: 'slack' | 'log' }> {
  const photos = [
    payload.hasPhotoMenu ? '메뉴' : null,
    payload.hasPhotoLocation ? '위치캡쳐' : null,
    payload.hasPhotoTruck ? '푸드트럭' : null,
  ]
    .filter(Boolean)
    .join(', ');

  const text = [
    '[순대차 등록 요청]',
    `이름: ${payload.name}`,
    `카테고리: ${payload.category}`,
    `메뉴: ${payload.menu}`,
    `오늘 운영: ${payload.todayHours}`,
    `위치: ${payload.locationText}`,
    payload.lat != null && payload.lng != null
      ? `좌표: ${payload.lat}, ${payload.lng}`
      : '좌표: (없음)',
    `사진: ${photos || '(없음)'}`,
    `요청 ID: ${payload.requestId}`,
    `시각: ${payload.createdAt}`,
  ].join('\n');

  const webhook = env.SLACK_WEBHOOK_REGISTRATION_URL?.trim();
  if (
    webhook &&
    (await postSlackWebhook(webhook, text, 'store_registration_notify'))
  ) {
    return { notified: true, channel: 'slack' };
  }

  console.log(
    JSON.stringify({
      level: 'info',
      event: 'store_registration_notify',
      channel: 'log',
      ...payload,
      text,
    })
  );

  return { notified: true, channel: 'log' };
}
