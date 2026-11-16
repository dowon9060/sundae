import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportAppOpen } from './api';

const LAST_DAY_KEY = 'sundaecha.last_app_open_day';

/** Asia/Seoul 기준 YYYY-MM-DD */
function kstDay(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * 앱 활성 기록. 같은 KST 일자에는 한 번만 서버로 보낸다.
 * 실패해도 앱 사용을 막지 않는다.
 */
export async function trackAppOpenOncePerDay(): Promise<void> {
  const today = kstDay();

  try {
    const saved = await AsyncStorage.getItem(LAST_DAY_KEY);
    if (saved === today) {
      return;
    }
  } catch (err) {
    console.warn(
      '[appOpen] last_day read failed',
      err instanceof Error ? err.message : err
    );
  }

  try {
    await reportAppOpen();
    await AsyncStorage.setItem(LAST_DAY_KEY, today);
  } catch (err) {
    console.warn(
      '[appOpen] report failed',
      err instanceof Error ? err.message : err
    );
  }
}
