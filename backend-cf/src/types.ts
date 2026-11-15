export type StoreCategory = 'sundae' | 'chicken' | 'other';
export type BusinessStatus = 'expected' | 'confirmed_open' | 'unknown';
export type StoreStatus = 'active' | 'inactive';

export type ReportReason =
  | 'hours_changed'
  | 'no_longer_comes'
  | 'location_changed'
  | 'price_changed';

export interface Env {
  DB: D1Database;
  LOCATION_STALE_DAYS: string;
  /** local | production */
  ENVIRONMENT?: string;
  /**
   * 관리자 키 — wrangler.toml vars에 두지 말고
   * 로컬 .dev.vars / 배포 secret 으로만 주입한다.
   */
  ADMIN_KEY?: string;
  /** 순대차 등록 요청 Slack Incoming Webhook. 없으면 로그. */
  SLACK_WEBHOOK_REGISTRATION_URL?: string;
  /** 정보 제보(수정) Slack Incoming Webhook. 없으면 로그. */
  SLACK_WEBHOOK_REPORT_URL?: string;
}

export interface StoreReportRow {
  id: string;
  store_id: string;
  reason: ReportReason;
  memo: string | null;
  created_at: string;
  notified_at: string | null;
}

export interface StoreRow {
  id: string;
  name: string;
  category: StoreCategory;
  description: string | null;
  photo_url: string | null;
  status: StoreStatus;
  business_status: BusinessStatus;
  created_at: string;
  like_count?: number;
}

export interface StoreLocationRow {
  store_id: string;
  lat: number;
  lng: number;
  address: string;
  location_note: string | null;
  updated_at: string;
}

export interface BusinessHourRow {
  id: number;
  store_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: number;
}

export interface MenuRow {
  id: number;
  store_id: string;
  name: string;
  price: number;
  photo_url: string | null;
  is_available: number;
  sort_order: number;
}

export interface ScheduleExceptionRow {
  id: number;
  store_id: string;
  date: string;
  is_closed: number;
  open_time: string | null;
  close_time: string | null;
  note: string | null;
}

export interface NearbyStoreResult extends StoreRow {
  lat: number;
  lng: number;
  address: string;
  location_note: string | null;
  location_updated_at: string;
  distance_m: number;
  location_stale: boolean;
  menu_summary: string | null;
  today_hours_label: string | null;
  /** 선택한 요일 기준 휴무 여부 */
  is_closed_on_day: boolean;
  like_count: number;
  /** client_id가 있을 때만 */
  liked?: boolean;
}
