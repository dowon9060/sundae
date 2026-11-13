export type ReportReason =
  | 'hours_changed'
  | 'no_longer_comes'
  | 'location_changed'
  | 'price_changed';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'hours_changed', label: '운영 요일이 달라졌어요' },
  { value: 'no_longer_comes', label: '더 이상 이 자리에 안 와요' },
  { value: 'location_changed', label: '위치가 달라졌어요' },
  { value: 'price_changed', label: '가격이 달라졌어요' },
];
