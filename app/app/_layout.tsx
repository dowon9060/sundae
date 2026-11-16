import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  useFonts,
} from '@expo-google-fonts/noto-sans-kr';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppSplash } from '../components/AppSplash';
import { colors, fonts } from '../constants/theme';
import { LocationProvider } from '../context/LocationContext';
import { trackAppOpenOncePerDay } from '../services/appOpen';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 숨겨진 경우 무시
});

/** 푸드트럭 로고를 최소로 보여주는 시간 */
const SPLASH_MIN_MS = 1200;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });
  const [splashDone, setSplashDone] = useState(false);
  const [minTimeDone, setMinTimeDone] = useState(false);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!fontsLoaded || !minTimeDone) return;
    let cancelled = false;
    (async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Expo Go 등에서 실패해도 인앱 스플래시로 대체
      }
      if (!cancelled) setSplashDone(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [fontsLoaded, minTimeDone]);

  useEffect(() => {
    if (!splashDone) return;
    void trackAppOpenOncePerDay();
  }, [splashDone]);

  const showSplash = !splashDone;

  return (
    <LocationProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: fonts.bold,
            fontSize: 17,
          },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="location"
          options={{ title: '위치 설정', headerBackTitle: '뒤로' }}
        />
        <Stack.Screen
          name="store/[id]"
          options={{ title: '판매점 상세', headerBackTitle: '뒤로' }}
        />
      </Stack>
      {showSplash ? <AppSplash /> : null}
    </LocationProvider>
  );
}
