import type { Env, ReportReason, StoreReportRow } from '../types';
import { notifyStoreReport } from './notify';
import { getStoreById } from './stores';

const VALID_REASONS: ReportReason[] = [
  'hours_changed',
  'no_longer_comes',
  'location_changed',
  'price_changed',
];

export function isValidReportReason(value: string): value is ReportReason {
  return (VALID_REASONS as string[]).includes(value);
}

export async function createStoreReport(
  env: Env,
  storeId: string,
  input: { reason: ReportReason; memo?: string | null }
): Promise<StoreReportRow> {
  const store = await getStoreById(env, storeId);
  if (!store) {
    throw new Error('STORE_NOT_FOUND');
  }

  const memo = input.memo?.trim() ? input.memo.trim().slice(0, 500) : null;
  const id = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO store_reports (id, store_id, reason, memo, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`
  )
    .bind(id, storeId, input.reason, memo)
    .run();

  const report = await env.DB.prepare(
    `SELECT * FROM store_reports WHERE id = ?`
  )
    .bind(id)
    .first<StoreReportRow>();

  if (!report) {
    throw new Error('REPORT_CREATE_FAILED');
  }

  const notifyResult = await notifyStoreReport(env, {
    reportId: report.id,
    storeId: store.id,
    storeName: store.name,
    reason: report.reason,
    memo: report.memo,
    createdAt: report.created_at,
  });

  if (notifyResult.notified) {
    await env.DB.prepare(
      `UPDATE store_reports SET notified_at = datetime('now') WHERE id = ?`
    )
      .bind(report.id)
      .run();
    report.notified_at = new Date().toISOString();
  }

  return report;
}
