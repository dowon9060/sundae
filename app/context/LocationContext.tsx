import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SavedLocation } from '../types/store';
import {
  DEFAULT_LOCATION,
  loadSavedLocation,
  requestGpsLocation,
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

  const applyLocation = useCallback(async (next: SavedLocation) => {
    await saveLocation(next);
    setLocation(next);
    setPermissionDenied(false);
    setError(null);
  }, []);

  const reloadSaved = useCallback(async () => {
    const saved = await loadSavedLocation();
    if (saved) setLocation(saved);
  }, []);

  const refreshGps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const gps = await requestGpsLocation();
      if (gps) {
        setLocation(gps);
        setPermissionDenied(false);
        return gps;
      }
      setPermissionDenied(true);
      const saved = await loadSavedLocation();
      setLocation(saved ?? DEFAULT_LOCATION);
      return null;
    } catch (e) {
      setError(e instanceof Error ? e.message : '위치를 가져오지 못했습니다.');
      const saved = await loadSavedLocation();
      setLocation(saved ?? DEFAULT_LOCATION);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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

        if (saved?.source === 'manual') {
          setLocation(saved);
          setLoading(false);
          return;
        }

        const gps = await requestGpsLocation();
        if (cancelled) return;

        if (gps) {
          setLocation(gps);
        } else {
          setPermissionDenied(true);
          setLocation(saved ?? DEFAULT_LOCATION);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : '위치를 가져오지 못했습니다.'
          );
          const saved = await loadSavedLocation();
          setLocation(saved ?? DEFAULT_LOCATION);
          setPermissionDenied(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
