import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchNearbyStores } from '../services/api';
import type { NearbyStore, StoreCategory } from '../types/store';

/** 현위치·지정 위치 기준 반경 5km */
const DEFAULT_RADIUS_M = 5000;
/** 동일 조건 재요청 최소 간격 */
const MIN_FETCH_GAP_MS = 5_000;

/** ~11m 단위로 반올림 — GPS 흔들림으로 같은 자리 재조회가 반복되지 않게 한다 */
function roundCoord(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}

export function useNearbyStores(
  lat: number | undefined,
  lng: number | undefined,
  category: StoreCategory,
  dayOfWeek: number,
  enabled = true
) {
  const rLat = lat == null ? undefined : roundCoord(lat);
  const rLng = lng == null ? undefined : roundCoord(lng);

  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastKeyRef = useRef('');
  const lastAtRef = useRef(0);
  const inflightRef = useRef(false);
  const seqRef = useRef(0);

  const refresh = useCallback(
    async (opts?: { force?: boolean }) => {
      if (!enabled) return;
      if (rLat == null || rLng == null) {
        setStores([]);
        setLoading(false);
        return;
      }

      const key = `${rLat}|${rLng}|${category}|${dayOfWeek}`;
      const now = Date.now();
      const keyChanged = key !== lastKeyRef.current;

      // 같은 조건 요청이 진행 중이면 중복 호출만 막는다.
      // 요일·카테고리·위치가 바뀌면 진행 중이어도 새 요청을 보낸다.
      if (inflightRef.current && !opts?.force && !keyChanged) {
        return;
      }

      if (
        !opts?.force &&
        !keyChanged &&
        now - lastAtRef.current < MIN_FETCH_GAP_MS
      ) {
        return;
      }

      if (
        opts?.force &&
        !keyChanged &&
        now - lastAtRef.current < 1_500
      ) {
        return;
      }

      lastKeyRef.current = key;
      lastAtRef.current = now;
      const seq = ++seqRef.current;
      inflightRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const data = await fetchNearbyStores({
          lat: rLat,
          lng: rLng,
          category,
          radius: DEFAULT_RADIUS_M,
          day: dayOfWeek,
        });
        if (seq !== seqRef.current) return;
        // 백엔드 미배포 대비: 선택한 요일 휴무 가게는 클라이언트에서도 숨김
        setStores(data.filter((s) => !s.is_closed_on_day));
      } catch (e) {
        if (seq !== seqRef.current) return;
        setError(
          e instanceof Error ? e.message : '판매점을 불러오지 못했습니다.'
        );
      } finally {
        if (seq === seqRef.current) {
          inflightRef.current = false;
          setLoading(false);
        }
      }
    },
    [rLat, rLng, category, dayOfWeek, enabled]
  );

  const updateStoreLike = useCallback(
    (storeId: string, liked: boolean, likeCount: number) => {
      setStores((prev) =>
        prev.map((s) =>
          s.id === storeId
            ? { ...s, liked, like_count: likeCount }
            : s
        )
      );
    },
    []
  );

  const updateStoreVerify = useCallback(
    (storeId: string, verified: boolean, verifyCount: number) => {
      setStores((prev) =>
        prev.map((s) =>
          s.id === storeId
            ? { ...s, verified, verify_count: verifyCount }
            : s
        )
      );
    },
    []
  );

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [refresh, enabled]);

  return { stores, loading, error, refresh, updateStoreLike, updateStoreVerify };
}
