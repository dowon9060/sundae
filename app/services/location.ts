import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoLocation from 'expo-location';
import type { SavedLocation } from '../types/store';
import { formatKoreanAddress, localizeAddressText } from './koreanAddress';

const STORAGE_KEY = 'sundaecha.saved_location';
const GPS_TIMEOUT_MS = 8_000;

/** 권한 거부·GPS 실패 시 기본 위치 (역삼동) */
export const DEFAULT_LOCATION: SavedLocation = {
  lat: 37.5007,
  lng: 127.0365,
  address: '서울특별시 강남구 역삼동',
  source: 'manual',
  updatedAt: new Date().toISOString(),
};

export function sameCoords(
  a: { lat: number; lng: number } | null | undefined,
  lat: number,
  lng: number,
  epsilon = 0.00005
): boolean {
  if (!a) return false;
  return Math.abs(a.lat - lat) < epsilon && Math.abs(a.lng - lng) < epsilon;
}

export async function loadSavedLocation(): Promise<SavedLocation | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw) as SavedLocation;
    return {
      ...saved,
      address: localizeAddressText(saved.address),
    };
  } catch {
    return null;
  }
}

export async function saveLocation(location: SavedLocation): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

export async function reverseGeocodeAddress(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const [place] = await ExpoLocation.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    const korean = formatKoreanAddress({
      region: place?.region,
      city: place?.city,
      district: place?.district,
      subregion: place?.subregion,
      street: place?.street,
      streetNumber: place?.streetNumber,
      name: place?.name,
    });

    if (korean) {
      return localizeAddressText(korean);
    }
  } catch {
    // fall through — 좌표 문자열로 대체
  }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} 시간이 초과되었습니다.`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/** 저장 위치를 바꾸지 않고 현재 GPS 좌표만 가져온다. 권한 거부 시 null */
export async function getCurrentGpsCoords(): Promise<{
  lat: number;
  lng: number;
} | null> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const position = await withTimeout(
    ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.High,
    }),
    GPS_TIMEOUT_MS,
    '위치 확인'
  );

  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
}

export async function requestGpsLocation(): Promise<SavedLocation | null> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const position = await withTimeout(
    ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    }),
    GPS_TIMEOUT_MS,
    '위치 확인'
  );

  const address = await withTimeout(
    reverseGeocodeAddress(
      position.coords.latitude,
      position.coords.longitude
    ),
    GPS_TIMEOUT_MS,
    '주소 변환'
  ).catch(() => {
    const { latitude, longitude } = position.coords;
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  });

  const saved: SavedLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    address,
    source: 'gps',
    updatedAt: new Date().toISOString(),
  };

  await saveLocation(saved);
  return saved;
}
