import { Alert, Linking, Platform } from 'react-native';

export type NavApp = 'naver' | 'kakao_map' | 'kakao_navi';

export interface NavDestination {
  name: string;
  lat: number;
  lng: number;
}

function buildUrls(dest: NavDestination): Record<
  NavApp,
  { app: string; web: string; label: string }
> {
  const encodedName = encodeURIComponent(dest.name);
  return {
    naver: {
      label: '네이버지도',
      app: `nmap://route/walk?dlat=${dest.lat}&dlng=${dest.lng}&dname=${encodedName}&appname=sundaecha`,
      web: `https://map.naver.com/v5/directions/-/-/${dest.lng},${dest.lat},${encodedName}/-/walk`,
    },
    kakao_map: {
      label: '카카오맵',
      app: `kakaomap://route?ep=${dest.lat},${dest.lng}&by=FOOT`,
      web: `https://map.kakao.com/link/to/${encodedName},${dest.lat},${dest.lng}`,
    },
    kakao_navi: {
      label: '카카오내비',
      app: `kakaonavi://navigate?name=${encodedName}&x=${dest.lng}&y=${dest.lat}&coord_type=wgs84`,
      web: `https://map.kakao.com/link/to/${encodedName},${dest.lat},${dest.lng}`,
    },
  };
}

async function openUrl(url: string): Promise<boolean> {
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export async function openNavigation(
  app: NavApp,
  dest: NavDestination
): Promise<void> {
  const urls = buildUrls(dest)[app];
  const opened = await openUrl(urls.app);
  if (opened) return;

  const webOpened = await openUrl(urls.web);
  if (webOpened) return;

  Alert.alert(
    '길찾기 불가',
    `${urls.label}을(를) 열 수 없습니다. 앱 설치 또는 브라우저를 확인해 주세요.`
  );
}

export function getNavOptions(): Array<{ key: NavApp; label: string }> {
  return [
    { key: 'naver', label: '네이버지도' },
    { key: 'kakao_map', label: '카카오맵' },
    { key: 'kakao_navi', label: '카카오내비' },
  ];
}

/** iOS에서 커스텀 URL 스킴 사용을 위해 Info.plist LSApplicationQueriesSchemes 필요 */
export const QUERY_SCHEMES =
  Platform.OS === 'ios'
    ? ['nmap', 'kakaomap', 'kakaonavi']
    : ['nmap', 'kakaomap', 'kakaonavi'];
