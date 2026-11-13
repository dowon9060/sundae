import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoLocation from 'expo-location';
import type { SavedLocation } from '../types/store';

const STORAGE_KEY = 'sundaecha.saved_location';

/** 권한 거부·GPS 실패 시 기본 위치 (역삼동) */
export const DEFAULT_LOCATION: SavedLocation = {
  lat: 37.5007,
  lng: 127.0365,
  address: '서울특별시 강남구 역삼동',
  source: 'manual',
  updatedAt: new Date().toISOString(),
};

export async function loadSavedLocation(): Promise<SavedLocation | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedLocation;
  } catch {
    return null;
  }
}

export async function saveLocation(location: SavedLocation): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

export async function requestGpsLocation(): Promise<SavedLocation | null> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const position = await ExpoLocation.getCurrentPositionAsync({
    accuracy: ExpoLocation.Accuracy.Balanced,
  });

  const [place] = await ExpoLocation.reverseGeocodeAsync({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });

  const addressParts = [
    place?.city || place?.region,
    place?.district,
    place?.street,
  ].filter(Boolean);

  const address =
    addressParts.length > 0
      ? addressParts.join(' ')
      : `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;

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
