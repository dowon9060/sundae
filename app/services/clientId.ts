import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'sundaecha.client_id';

function createClientId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `c_${time}_${rand}`;
}

let cached: string | null = null;

/** 기기별 좋아요용 클라이언트 ID (로그인 없이 사용) */
export async function getClientId(): Promise<string> {
  if (cached) return cached;

  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (saved && /^[A-Za-z0-9_-]{8,64}$/.test(saved)) {
    cached = saved;
    return saved;
  }

  const next = createClientId();
  await AsyncStorage.setItem(STORAGE_KEY, next);
  cached = next;
  return next;
}
