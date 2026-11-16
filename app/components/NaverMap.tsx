import { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import {
  CATEGORY_MARKER_COLORS,
  CATEGORY_MARKER_EMOJI,
  DEFAULT_TRUCK_MARKER_URI,
  type MapStoreCategory,
} from '../constants/mapMarkerIcons';
import { colors, fonts } from '../constants/theme';

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  /** user=현위치(일반 핀), store=판매점(푸드트럭) */
  kind?: 'user' | 'store';
  /** store 마커일 때 카테고리별 아이콘 */
  category?: MapStoreCategory;
}

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  /**
   * 레거시: 핀 드래그·지도 탭으로 위치 선택
   * centerPin 모드가 우선이면 무시됨
   */
  interactive?: boolean;
  /** 확대·축소·이동 허용 */
  navigable?: boolean;
  /**
   * true면 초기 중심을 lat/lng로 맞추고 fitBounds 하지 않음
   */
  lockCenter?: boolean;
  /**
   * 중앙 고정 핀 모드 — 지도만 움직이고 선택 좌표는 지도 중심
   * (지도에서 위치 선택)
   */
  centerPin?: boolean;
  /** 단일 마커 라벨 (markers 미사용·centerPin 아닐 때) */
  label?: string;
  markers?: MapMarker[];
  style?: StyleProp<ViewStyle>;
  onPick?: (lat: number, lng: number) => void;
  /** 지도 이동이 멈췄을 때 중심 좌표 */
  onCameraIdle?: (lat: number, lng: number) => void;
  onPressMarker?: (index: number) => void;
}

const NCP_KEY_ID = process.env.EXPO_PUBLIC_NCP_KEY_ID?.trim() ?? '';
const MAP_BASE_URL = 'https://localhost';

function buildHtml(
  keyId: string,
  lat: number,
  lng: number,
  zoom: number,
  interactive: boolean,
  navigable: boolean,
  lockCenter: boolean,
  centerPin: boolean,
  label: string,
  markers: MapMarker[],
  markerIconUri: string,
  categoryEmoji: Record<string, string>,
  categoryColors: Record<string, string>
) {
  const markerPayload = JSON.stringify(
    centerPin
      ? []
      : markers.length > 0
        ? markers
        : [{ lat, lng, label: label || '', kind: 'store', category: 'other' }]
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
    navigable || centerPin
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
    var navigable = ${navigable || centerPin ? 'true' : 'false'};
    var lockCenter = ${lockCenter ? 'true' : 'false'};
    var centerPin = ${centerPin ? 'true' : 'false'};
    var points = ${markerPayload};
    var truckIconUri = ${JSON.stringify(markerIconUri)};
    var categoryEmoji = ${JSON.stringify(categoryEmoji)};
    var categoryColors = ${JSON.stringify(categoryColors)};
    var map = null;
    var marker = null;
    var markers = [];
    var idleTimer = null;

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

    /** 일반 위치 핀 (눈물방울형) */
    function locationPinIcon(text, color) {
      var fill = color || '#E14C4C';
      var label = text
        ? '<div style="margin-top:2px;padding:2px 7px;border-radius:8px;background:rgba(0,0,0,.78);color:#fff;font:700 10px/1.2 sans-serif;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.2);">' +
          escapeHtml(text) +
          '</div>'
        : '';
      var html =
        '<div style="width:40px;text-align:center;transform:translateY(-2px);">' +
        '<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M18 0C8.6 0 1 7.6 1 17c0 12.2 17 27 17 27s17-14.8 17-27C35 7.6 27.4 0 18 0z" fill="' + fill + '" stroke="#fff" stroke-width="2"/>' +
        '<circle cx="18" cy="16" r="6" fill="#fff"/>' +
        '</svg>' +
        label +
        '</div>';
      return {
        content: html,
        size: new naver.maps.Size(40, text ? 62 : 44),
        anchor: new naver.maps.Point(20, 44)
      };
    }

    function pinIcon(text, category) {
      var cat = category || 'other';
      var emoji = categoryEmoji[cat] || '';
      var border = categoryColors[cat] || '#2FBF5B';
      var label = text
        ? '<div style="margin-top:3px;max-width:110px;padding:3px 7px;border-radius:8px;background:#fff;color:#111;font:600 11px/1.2 sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 8px rgba(0,0,0,.14);">' +
          escapeHtml(text) +
          '</div>'
        : '';
      var badge;
      if (emoji) {
        badge =
          '<div style="width:48px;height:48px;border-radius:14px;margin:0 auto;background:#fff;' +
          'border:2px solid ' + border + ';box-shadow:0 3px 10px rgba(0,0,0,.28);' +
          'font-size:26px;line-height:48px;text-align:center;">' +
          emoji +
          '</div>';
      } else {
        badge =
          '<img src="' + truckIconUri + '" width="52" height="52" alt="" ' +
          'style="width:52px;height:52px;border-radius:14px;display:block;margin:0 auto;' +
          'box-shadow:0 3px 10px rgba(0,0,0,.28);border:2px solid ' + border + ';background:#fff;" />';
      }
      var html =
        '<div style="width:56px;text-align:center;">' +
        badge +
        label +
        '</div>';
      return {
        content: html,
        size: new naver.maps.Size(56, text ? 78 : 56),
        anchor: new naver.maps.Point(28, text ? 56 : 52)
      };
    }

    function clearMarkers() {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
      marker = null;
    }

    function addPointMarker(p, index) {
      var pos = new naver.maps.LatLng(Number(p.lat), Number(p.lng));
      var isUser = p.kind === 'user';
      var icon = isUser
        ? locationPinIcon(p.label || '현위치', '#2B6CFF')
        : pinIcon(p.label || '', p.category || 'other');
      var m;
      try {
        m = new naver.maps.Marker({
          position: pos,
          map: map,
          draggable: false,
          icon: icon,
          zIndex: isUser ? 1000 : 100 + index,
          clickable: !isUser
        });
      } catch (err) {
        m = new naver.maps.Marker({
          position: pos,
          map: map,
          title: p.label || '',
          clickable: !isUser
        });
      }
      if (!isUser) {
        (function (i) {
          naver.maps.Event.addListener(m, 'click', function () {
            post({ type: 'marker', index: i });
          });
        })(index);
      }
      markers.push(m);
      if (index === 0) marker = m;
      return pos;
    }

    function renderPoints(list) {
      clearMarkers();
      points = list || [];
      for (var i = 0; i < points.length; i++) {
        addPointMarker(points[i], i);
      }
      post({ type: 'markers', count: markers.length });
    }

    function postCenterIdle() {
      if (!map) return;
      var c = map.getCenter();
      post({ type: 'idle', lat: c.y, lng: c.x });
      if (centerPin) {
        post({ type: 'pick', lat: c.y, lng: c.x });
      }
    }

    function scheduleIdle() {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(postCenterIdle, 280);
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

        if (!centerPin) {
          renderPoints(points);
        }

        if (lockCenter || centerPin) {
          map.setCenter(new naver.maps.LatLng(lat, lng));
          map.setZoom(${zoom}, false);
        } else if (points.length > 1) {
          var bounds = new naver.maps.LatLngBounds();
          for (var i = 0; i < points.length; i++) {
            bounds.extend(new naver.maps.LatLng(Number(points[i].lat), Number(points[i].lng)));
          }
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

        // 지도 이동 종료 시 중심 좌표 전달
        naver.maps.Event.addListener(map, 'dragend', scheduleIdle);
        naver.maps.Event.addListener(map, 'zoom_changed', scheduleIdle);
        naver.maps.Event.addListener(map, 'idle', scheduleIdle);

        // 레거시 interactive (centerPin 아닐 때 탭/드래그)
        if (interactive && !centerPin && points.length === 1 && marker) {
          marker.setDraggable(true);
          naver.maps.Event.addListener(marker, 'dragend', function () {
            var p = marker.getPosition();
            post({ type: 'pick', lat: p.y, lng: p.x });
          });
          naver.maps.Event.addListener(map, 'click', function (e) {
            marker.setPosition(e.coord);
            post({ type: 'pick', lat: e.coord.y, lng: e.coord.x });
          });
        }

        post({ type: 'ready', provider: 'naver' });
        if (centerPin) postCenterIdle();
      } catch (e) {
        post({ type: 'error', message: String(e && e.message ? e.message : e) });
      }
    }

    function setPosition(nextLat, nextLng) {
      lat = nextLat;
      lng = nextLng;
      if (!map) return;
      var pos = new naver.maps.LatLng(nextLat, nextLng);
      map.setCenter(pos);
      if (marker && !centerPin) marker.setPosition(pos);
    }

    function setMarkersFromNative(list) {
      if (!map || centerPin) return;
      renderPoints(list || []);
    }

    document.addEventListener('message', function (event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'set') setPosition(data.lat, data.lng);
        if (data.type === 'markers') setMarkersFromNative(data.points);
      } catch (e) {}
    });
    window.addEventListener('message', function (event) {
      try {
        var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'set') setPosition(data.lat, data.lng);
        if (data && data.type === 'markers') setMarkersFromNative(data.points);
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
  lockCenter = false,
  centerPin = false,
  label = '',
  markers,
  style,
  onPick,
  onCameraIdle,
  onPressMarker,
}: Props) {
  const webRef = useRef<WebView>(null);
  const [authFailed, setAuthFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const markerKey = JSON.stringify(markers ?? []);
  const canNavigate =
    navigable ??
    centerPin ??
    (interactive || (markers != null && markers.length > 0));

  const html = useMemo(
    () =>
      NCP_KEY_ID
        ? buildHtml(
            NCP_KEY_ID,
            lat,
            lng,
            zoom,
            interactive,
            Boolean(canNavigate),
            lockCenter,
            centerPin,
            label,
            markers ?? [],
            DEFAULT_TRUCK_MARKER_URI,
            CATEGORY_MARKER_EMOJI,
            CATEGORY_MARKER_COLORS
          )
        : '',
    // 초기 HTML만 — 이후 마커는 inject 로 갱신 (카메라 유지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interactive, canNavigate, lockCenter, centerPin, zoom, label]
  );

  // 지도 준비 후 / markers 변경 시 판매점·현위치 마커만 갱신
  useEffect(() => {
    if (!ready || !NCP_KEY_ID || authFailed || centerPin) return;
    const points = markers ?? [];
    const js = `setMarkersFromNative(${JSON.stringify(points)}); true;`;
    webRef.current?.injectJavaScript(js);
  }, [ready, markerKey, authFailed, centerPin, markers]);

  useEffect(() => {
    if (!NCP_KEY_ID || authFailed || centerPin) return;
    if (markers && markers.length > 0) return;
    const js = `setPosition(${lat}, ${lng}); true;`;
    webRef.current?.injectJavaScript(js);
  }, [lat, lng, authFailed, markers, centerPin]);

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
      if (data.type === 'ready') {
        setReady(true);
        return;
      }
      if (data.type === 'marker' && typeof data.index === 'number') {
        onPressMarker?.(data.index);
        return;
      }
      if (
        data.type === 'idle' &&
        typeof data.lat === 'number' &&
        typeof data.lng === 'number'
      ) {
        onCameraIdle?.(data.lat, data.lng);
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
          NCP 콘솔에서 Maps Application의 Dynamic Map을 켜고, Web 서비스 URL에
          https://localhost 와 http://localhost 를 등록한 뒤 앱을 다시 설치해
          주세요.
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
        allowFileAccess
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        scrollEnabled={false}
        nestedScrollEnabled
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
        overScrollMode="never"
        bounces={false}
      />
      {centerPin ? (
        <View pointerEvents="none" style={styles.centerPinWrap}>
          <View style={styles.centerPin}>
            <View style={styles.pinHead} />
            <View style={styles.pinPoint} />
          </View>
        </View>
      ) : null}
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
  centerPinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPin: {
    alignItems: 'center',
    marginTop: -22,
  },
  pinHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E14C4C',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinPoint: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E14C4C',
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
