import { useCallback, useEffect, useState } from 'react';
import { fetchNearbyStores } from '../services/api';
import type { NearbyStore, StoreCategory } from '../types/store';

export function useNearbyStores(
  lat: number | undefined,
  lng: number | undefined,
  category: StoreCategory
) {
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (lat == null || lng == null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNearbyStores({ lat, lng, category });
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
