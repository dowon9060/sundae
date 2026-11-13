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
  ADMIN_KEY: string;
  /** Slack Incoming Webhook. 없으면 로그로 알림을 남긴다. */
  SLACK_WEBHOOK_URL?: string;
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
}
