import type { ReportReason } from '../constants/report';
import type {
  BusinessHour,
  LocationSearchResult,
  MenuItem,
  NearbyStore,
  StoreCategory,
  StoreDetail,
} from '../types/store';

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8787';

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new Error('네트워크에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error || `요청 실패 (${res.status})`
    );
  }
  return res.json() as Promise<T>;
}

export async function fetchNearbyStores(params: {
  lat: number;
  lng: number;
  category?: StoreCategory;
  radius?: number;
}): Promise<NearbyStore[]> {
  const qs = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    category: params.category || 'all',
    radius: String(params.radius ?? 5000),
  });
  const json = await request<{ data: NearbyStore[] }>(
    `/api/stores/nearby?${qs}`
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
