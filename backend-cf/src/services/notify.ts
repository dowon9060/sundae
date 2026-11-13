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

/**
 * 제보 알림.
 * 현재는 구조화 로그로 남기고, 이후 Slack Incoming Webhook으로 교체한다.
 * SLACK_WEBHOOK_URL이 있으면 즉시 전송을 시도한다.
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

  const webhook = env.SLACK_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        return { notified: true, channel: 'slack' };
      }
      console.error(
        JSON.stringify({
          level: 'error',
          message: 'slack_webhook_failed',
          status: res.status,
        })
      );
    } catch (err) {
      console.error(
        JSON.stringify({
          level: 'error',
          message: 'slack_webhook_error',
          detail: err instanceof Error ? err.message : 'unknown',
        })
      );
    }
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
