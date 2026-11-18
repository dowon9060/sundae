import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { SavedLocation } from '../types/store';
import {
  DEFAULT_LOCATION,
  loadSavedLocation,
  requestGpsLocation,
  sameCoords,
  saveLocation,
} from '../services/location';

interface LocationContextValue {
  location: SavedLocation | null;
  loading: boolean;
  permissionDenied: boolean;
  error: string | null;
  refreshGps: () => Promise<SavedLocation | null>;
  setManualLocation: (
    lat: number,
    lng: number,
    address: string
  ) => Promise<void>;
  reloadSaved: () => Promise<void>;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastGpsAtRef = useRef(0);
  const locationRef = useRef(location);
  locationRef.current = location;

  const commitLocation = useCallback((next: SavedLocation) => {
    const prev = locationRef.current;
    if (
      prev &&
      sameCoords(prev, next.lat, next.lng) &&
      prev.address === next.address &&
      prev.source === next.source
    ) {
      return prev;
    }
    locationRef.current = next;
    setLocation(next);
    return next;
  }, []);

  const applyLocation = useCallback(
    async (next: SavedLocation) => {
      await saveLocation(next);
      commitLocation(next);
      setPermissionDenied(false);
      setError(null);
    },
    [commitLocation]
  );

  const reloadSaved = useCallback(async () => {
    const saved = await loadSavedLocation();
    if (saved) commitLocation(saved);
  }, [commitLocation]);

  const refreshGps = useCallback(async () => {
    const now = Date.now();
    if (lastGpsAtRef.current > 0 && now - lastGpsAtRef.current < 8_000) {
      return locationRef.current;
    }
    lastGpsAtRef.current = now;

    setError(null);
    try {
      const gps = await requestGpsLocation();
      if (gps) {
        commitLocation(gps);
        setPermissionDenied(false);
        return gps;
      }
      setPermissionDenied(true);
      const saved = await loadSavedLocation();
      commitLocation(saved ?? DEFAULT_LOCATION);
      return null;
    } catch (e) {
      setError(e instanceof Error ? e.message : '위치를 가져오지 못했습니다.');
      const saved = await loadSavedLocation();
      if (!locationRef.current) {
        commitLocation(saved ?? DEFAULT_LOCATION);
      }
      return locationRef.current;
    }
  }, [commitLocation]);

  const setManualLocation = useCallback(
    async (lat: number, lng: number, address: string) => {
      const next: SavedLocation = {
        lat,
        lng,
        address,
        source: 'manual',
        updatedAt: new Date().toISOString(),
      };
      await applyLocation(next);
    },
    [applyLocation]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const saved = await loadSavedLocation();
        if (cancelled) return;

        // 저장된 위치가 있으면 즉시 화면·목록 사용 (GPS 대기로 스피너 고정 방지)
        if (saved) {
          commitLocation(saved);
          setLoading(false);
        }

        lastGpsAtRef.current = Date.now();
        const gps = await requestGpsLocation();
        if (cancelled) return;

        if (gps) {
          // 저장된 위치와 크게 다르지 않으면 목록 재조회를 유발하지 않는다
          if (!saved || !sameCoords(saved, gps.lat, gps.lng, 0.0008)) {
            commitLocation(gps);
          }
          setPermissionDenied(false);
        } else if (!saved) {
          setPermissionDenied(true);
          commitLocation(DEFAULT_LOCATION);
        } else {
          setPermissionDenied(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : '위치를 가져오지 못했습니다.'
          );
          if (!locationRef.current) {
            const saved = await loadSavedLocation();
            commitLocation(saved ?? DEFAULT_LOCATION);
          }
          setPermissionDenied(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [commitLocation]);

  const value = useMemo(
    () => ({
      location,
      loading,
      permissionDenied,
      error,
      refreshGps,
      setManualLocation,
      reloadSaved,
    }),
    [
      location,
      loading,
      permissionDenied,
      error,
      refreshGps,
      setManualLocation,
      reloadSaved,
    ]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocation은 LocationProvider 안에서 사용해야 합니다.');
  }
  return ctx;
}
