import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  onPick?: (lat: number, lng: number) => void;
}

function buildHtml(
  lat: number,
  lng: number,
  zoom: number,
  interactive: boolean
) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #f0f0f2; }
    .leaflet-control-attribution { font-size: 10px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var lat = ${lat};
    var lng = ${lng};
    var interactive = ${interactive ? 'true' : 'false'};
    var map = L.map('map', {
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
      tap: interactive
    }).setView([lat, lng], ${zoom});

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var marker = L.marker([lat, lng], { draggable: interactive }).addTo(map);

    function post(coord) {
      if (!interactive) return;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'pick',
          lat: coord.lat,
          lng: coord.lng
        }));
      }
    }

    marker.on('dragend', function () {
      var p = marker.getLatLng();
      post(p);
    });

    if (interactive) {
      map.on('click', function (e) {
        marker.setLatLng(e.latlng);
        post(e.latlng);
      });
    }

    function setPosition(nextLat, nextLng) {
      lat = nextLat;
      lng = nextLng;
      marker.setLatLng([nextLat, nextLng]);
      map.setView([nextLat, nextLng], map.getZoom());
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

export function OsmMap({
  lat,
  lng,
  zoom = 16,
  interactive = false,
  style,
  onPick,
}: Props) {
  const webRef = useRef<WebView>(null);
  const html = useMemo(
    () => buildHtml(lat, lng, zoom, interactive),
    // html은 최초 로드용. 이후 좌표는 inject로 반영
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interactive, zoom]
  );

  useEffect(() => {
    const js = `setPosition(${lat}, ${lng}); true;`;
    webRef.current?.injectJavaScript(js);
  }, [lat, lng]);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        lat?: number;
        lng?: number;
      };
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

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
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
});
