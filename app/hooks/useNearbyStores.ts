import { useCallback, useEffect, useState } from 'react';
import { fetchNearbyStores } from '../services/api';
import type { NearbyStore, StoreCategory } from '../types/store';

/** 서울 전역 이동식 판매점 커버 (약 25km) */
const DEFAULT_RADIUS_M = 25000;

export function useNearbyStores(
  lat: number | undefined,
  lng: number | undefined,
  category: StoreCategory
) {
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (lat == null || lng == null) {
      setStores([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchNearbyStores({
        lat,
        lng,
        category,
        radius: DEFAULT_RADIUS_M,
      });
      setStores(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '판매점을 불러오지 못했습니다.');
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, category]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stores, loading, error, refresh };
}
