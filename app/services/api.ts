import type { ReportReason } from '../constants/report';
import type {
  BusinessHour,
  LocationSearchResult,
  MenuItem,
  NearbyStore,
  StoreCategory,
  StoreDetail,
} from '../types/store';
import { apiFetch } from './apiClient';
import { getClientId } from './clientId';

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8787';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(`${API_BASE}${path}`, init);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (body as { error?: string }).error || `요청 실패 (${res.status})`;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function fetchNearbyStores(params: {
  lat: number;
  lng: number;
  category?: StoreCategory;
  radius?: number;
  /** 0=일 … 6=토 */
  day?: number;
}): Promise<NearbyStore[]> {
  const qs = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    category: params.category || 'all',
    radius: String(params.radius ?? 5000),
  });
  if (params.day != null) {
    qs.set('day', String(params.day));
  }
  try {
    const clientId = await getClientId();
    qs.set('client_id', clientId);
  } catch {
    // 클라이언트 ID 없이도 목록은 조회
  }
  const json = await request<{ data: NearbyStore[] }>(
    `/api/stores/nearby?${qs}`
  );
  return (json.data ?? []).map((s) => ({
    ...s,
    like_count: Number(s.like_count ?? 0),
    liked: Boolean(s.liked),
  }));
}

export async function toggleStoreLike(
  storeId: string
): Promise<{ liked: boolean; like_count: number }> {
  const clientId = await getClientId();
  const json = await request<{ data: { liked: boolean; like_count: number } }>(
    `/api/stores/${storeId}/likes`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId }),
    }
  );
  return json.data;
}

export async function fetchStoreDetail(
  id: string,
  lat?: number,
  lng?: number
): Promise<StoreDetail> {
  const qs = new URLSearchParams();
  if (lat != null && lng != null) {
    qs.set('lat', String(lat));
    qs.set('lng', String(lng));
  }
  const suffix = qs.toString() ? `?${qs}` : '';
  const json = await request<{ data: StoreDetail }>(
    `/api/stores/${id}${suffix}`
  );
  return json.data;
}

export async function fetchStoreMenus(id: string): Promise<MenuItem[]> {
  const json = await request<{ data: MenuItem[] }>(`/api/stores/${id}/menus`);
  return json.data;
}

export async function fetchStoreHours(id: string): Promise<{
  hours: BusinessHour[];
  today_exception: {
    date: string;
    is_closed: boolean;
    open_time: string | null;
    close_time: string | null;
    note: string | null;
  } | null;
}> {
  const json = await request<{
    data: {
      hours: BusinessHour[];
      today_exception: {
        date: string;
        is_closed: boolean;
        open_time: string | null;
        close_time: string | null;
        note: string | null;
      } | null;
    };
  }>(`/api/stores/${id}/hours`);
  return json.data;
}

export async function searchLocations(
  q: string
): Promise<LocationSearchResult[]> {
  if (!q.trim()) return [];
  const json = await request<{ data: LocationSearchResult[] }>(
    `/api/locations/search?q=${encodeURIComponent(q.trim())}`
  );
  return json.data;
}

export async function submitStoreReport(
  storeId: string,
  body: { reason: ReportReason; memo?: string | null }
): Promise<{ message: string }> {
  const json = await request<{ message: string }>(
    `/api/stores/${storeId}/reports`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: body.reason,
        memo: body.memo ?? null,
      }),
    }
  );
  return { message: json.message };
}

export interface StoreRegistrationPayload {
  name: string;
  menu: string;
  today_hours: string;
  location_text: string;
  lat?: number | null;
  lng?: number | null;
  photo_menu?: string | null;
  photo_location?: string | null;
  photo_truck?: string | null;
}

export async function submitStoreRegistration(
  body: StoreRegistrationPayload
): Promise<{ message: string }> {
  const json = await request<{ message: string }>(
    '/api/stores/registration-requests',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  return { message: json.message };
}
