import { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { FOOD_TRUCK_MARKER_DATA_URI } from '../constants/foodTruckMarkerData';
import { colors, fonts } from '../constants/theme';

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
}

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  /** 핀 드래그·지도 탭으로 위치 선택 */
  interactive?: boolean;
  /** 확대·축소·이동 허용 (지도로 보기 등) */
  navigable?: boolean;
  /** 단일 마커 라벨 (markers 미사용 시) */
  label?: string;
  /** 여러 핀. 있으면 이 목록으로 표시 */
  markers?: MapMarker[];
  style?: StyleProp<ViewStyle>;
  onPick?: (lat: number, lng: number) => void;
  onPressMarker?: (index: number) => void;
}

const NCP_KEY_ID = process.env.EXPO_PUBLIC_NCP_KEY_ID?.trim() ?? '';
const MAP_BASE_URL = 'http://localhost';

function buildHtml(
  keyId: string,
  lat: number,
  lng: number,
  zoom: number,
  interactive: boolean,
  navigable: boolean,
  label: string,
  markers: MapMarker[],
  markerIconUri: string
) {
  const markerPayload = JSON.stringify(
    markers.length > 0
      ? markers
      : [{ lat, lng, label: label || '' }]
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #f0f0f2; touch-action: none; }
    .zoom-ui {
      position: absolute; right: 12px; bottom: 16px; z-index: 10;
      display: flex; flex-direction: column; gap: 8px;
    }
    .zoom-btn {
      width: 44px; height: 44px; border: none; border-radius: 12px;
      background: #fff; color: #111; font: 700 22px/1 -apple-system, sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,.18);
    }
  </style>
  <script>
    window.navermap_authFailure = function () {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'auth_fail' }));
      }
    };
  </script>
  <script type="text/javascript"
    src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(keyId)}&callback=initMap"></script>
</head>
<body>
  <div id="map"></div>
  ${
    navigable
      ? `<div class="zoom-ui">
    <button type="button" class="zoom-btn" id="zoomIn" aria-label="확대">+</button>
    <button type="button" class="zoom-btn" id="zoomOut" aria-label="축소">−</button>
  </div>`
      : ''
  }
  <script>
    var lat = ${lat};
    var lng = ${lng};
    var interactive = ${interactive ? 'true' : 'false'};
    var navigable = ${navigable ? 'true' : 'false'};
    var points = ${markerPayload};
    var truckIconUri = ${JSON.stringify(markerIconUri)};
    var map = null;
    var marker = null;
    var markers = [];

    function post(payload) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

    function escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /** 푸드트럭 아이콘 마커 — size 필수 */
    function pinIcon(text) {
      var label = text
        ? '<div style="margin-top:3px;max-width:110px;padding:3px 7px;border-radius:8px;background:#fff;color:#111;font:600 11px/1.2 sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 8px rgba(0,0,0,.14);">' +
          escapeHtml(text) +
          '</div>'
        : '';
      var html =
        '<div style="width:56px;text-align:center;">' +
        '<img src="' + truckIconUri + '" width="52" height="52" alt="" ' +
        'style="width:52px;height:52px;border-radius:14px;display:block;margin:0 auto;' +
        'box-shadow:0 3px 10px rgba(0,0,0,.28);border:2px solid #2FBF5B;background:#fff;" />' +
        label +
        '</div>';
      return {
        content: html,
        size: new naver.maps.Size(56, text ? 78 : 56),
        anchor: new naver.maps.Point(28, text ? 56 : 52)
      };
    }

    function postPick(nextLat, nextLng) {
      if (!interactive) return;
      post({ type: 'pick', lat: nextLat, lng: nextLng });
    }

    function initMap() {
      try {
        map = new naver.maps.Map('map', {
          center: new naver.maps.LatLng(lat, lng),
          zoom: ${zoom},
          draggable: navigable,
          pinchZoom: navigable,
          scrollWheel: navigable,
          keyboardShortcuts: navigable,
          disableDoubleTapZoom: !navigable,
          disableDoubleClickZoom: !navigable,
          disableTwoFingerTapZoom: !navigable,
          zoomControl: false,
          mapDataControl: false,
          scaleControl: false,
          logoControl: true,
          mapTypeControl: false
        });

        var bounds = new naver.maps.LatLngBounds();
        markers = [];

        points.forEach(function (p, index) {
          var pos = new naver.maps.LatLng(Number(p.lat), Number(p.lng));
          bounds.extend(pos);
          var m;
          try {
            m = new naver.maps.Marker({
              position: pos,
              map: map,
              draggable: interactive && points.length === 1,
              icon: pinIcon(p.label || ''),
              zIndex: 100 + index,
              clickable: true
            });
          } catch (err) {
            // HTML 아이콘 실패 시 기본 마커
            m = new naver.maps.Marker({
              position: pos,
              map: map,
              draggable: interactive && points.length === 1,
              title: p.label || '',
              clickable: true
            });
          }
          (function (i) {
            naver.maps.Event.addListener(m, 'click', function () {
              post({ type: 'marker', index: i });
            });
          })(index);
          markers.push(m);
          if (index === 0) marker = m;
        });

        post({ type: 'markers', count: markers.length });

        if (points.length > 1) {
          map.fitBounds(bounds, { top: 64, right: 64, bottom: 64, left: 64 });
        } else if (points.length === 1) {
          map.setCenter(new naver.maps.LatLng(Number(points[0].lat), Number(points[0].lng)));
        }

        if (navigable) {
          var zin = document.getElementById('zoomIn');
          var zout = document.getElementById('zoomOut');
          if (zin) zin.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            map.setZoom(map.getZoom() + 1, true);
          });
          if (zout) zout.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            map.setZoom(map.getZoom() - 1, true);
          });
        }

        if (interactive && points.length === 1 && marker) {
          naver.maps.Event.addListener(marker, 'dragend', function () {
            var p = marker.getPosition();
            postPick(p.y, p.x);
          });
          naver.maps.Event.addListener(map, 'click', function (e) {
            marker.setPosition(e.coord);
            postPick(e.coord.y, e.coord.x);
          });
        }
        post({ type: 'ready', provider: 'naver' });
      } catch (e) {
        post({ type: 'error', message: String(e && e.message ? e.message : e) });
      }
    }

    function setPosition(nextLat, nextLng) {
      lat = nextLat;
      lng = nextLng;
      if (!map || !marker) return;
      var pos = new naver.maps.LatLng(nextLat, nextLng);
      marker.setPosition(pos);
      map.setCenter(pos);
    }

    document.addEventListener('message', function (event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'set') setPosition(data.lat, data.lng);
      } catch (e) {}
    });
    window.addEventListener('message', function (event) {
      try {
        var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'set') setPosition(data.lat, data.lng);
      } catch (e) {}
    });
  </script>
</body>
</html>`;
}

export function NaverMap({
  lat,
  lng,
  zoom = 16,
  interactive = false,
  navigable,
  label = '',
  markers,
  style,
  onPick,
  onPressMarker,
}: Props) {
  const webRef = useRef<WebView>(null);
  const [authFailed, setAuthFailed] = useState(false);
  const markerKey = JSON.stringify(markers ?? []);
  const canNavigate =
    navigable ?? (interactive || (markers != null && markers.length > 0));

  const html = useMemo(
    () =>
      NCP_KEY_ID
        ? buildHtml(
            NCP_KEY_ID,
            lat,
            lng,
            zoom,
            interactive,
            canNavigate,
            label,
            markers ?? [],
            FOOD_TRUCK_MARKER_DATA_URI
          )
        : '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interactive, canNavigate, zoom, label, markerKey, lat, lng]
  );

  useEffect(() => {
    if (!NCP_KEY_ID || authFailed || (markers && markers.length > 0)) return;
    const js = `setPosition(${lat}, ${lng}); true;`;
    webRef.current?.injectJavaScript(js);
  }, [lat, lng, authFailed, markers]);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        lat?: number;
        lng?: number;
        index?: number;
      };
      if (data.type === 'auth_fail') {
        setAuthFailed(true);
        return;
      }
      if (data.type === 'marker' && typeof data.index === 'number') {
        onPressMarker?.(data.index);
        return;
      }
      if (
        data.type === 'pick' &&
        typeof data.lat === 'number' &&
        typeof data.lng === 'number'
      ) {
        onPick?.(data.lat, data.lng);
      }
    } catch {
      // ignore
    }
  };

  if (!NCP_KEY_ID) {
    return (
      <View style={[styles.wrap, styles.fallback, style]}>
        <Text style={styles.fallbackTitle}>네이버 지도 키가 필요합니다</Text>
        <Text style={styles.fallbackBody}>
          app/.env에 EXPO_PUBLIC_NCP_KEY_ID를 넣고, NCP 콘솔 Web 서비스 URL에
          http://localhost 를 등록한 뒤 앱을 다시 시작하세요.
        </Text>
      </View>
    );
  }

  if (authFailed) {
    return (
      <View style={[styles.wrap, styles.fallback, style]}>
        <Text style={styles.fallbackTitle}>네이버 지도 인증에 실패했습니다</Text>
        <Text style={styles.fallbackBody}>
          NCP 콘솔에서 Dynamic Map과 Web 서비스 URL(http://localhost)을 확인해
          주세요. 다른 지도는 표시하지 않습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]} collapsable={false}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html, baseUrl: MAP_BASE_URL }}
        style={styles.web}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
        mixedContentMode="always"
        overScrollMode="never"
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#F0F0F2',
  },
  web: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  fallbackTitle: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 15,
    textAlign: 'center',
  },
  fallbackBody: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
