import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LocationMapPicker } from '../components/LocationMapPicker';
import { colors, fonts, spacing, typography } from '../constants/theme';
import { useLocation } from '../hooks/useLocation';
import { DEFAULT_LOCATION } from '../services/location';
import { searchLocations } from '../services/api';
import type { LocationSearchResult } from '../types/store';

const SEARCH_DEBOUNCE_MS = 250;

export default function LocationScreen() {
  const router = useRouter();
  const { location, setManualLocation, refreshGps } = useLocation();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const canSearch = useMemo(() => query.trim().length >= 1, [query]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setSearching(true);
    setError(null);

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const data = await searchLocations(trimmed);
          if (requestId !== requestIdRef.current) return;
          setResults(data);
        } catch (e) {
          if (requestId !== requestIdRef.current) return;
          setError(e instanceof Error ? e.message : '검색에 실패했습니다.');
          setResults([]);
        } finally {
          if (requestId === requestIdRef.current) {
            setSearching(false);
          }
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const selectResult = async (item: LocationSearchResult) => {
    await setManualLocation(item.lat, item.lng, item.address);
    router.back();
  };

  const useGps = async () => {
    setGpsLoading(true);
    setError(null);
    try {
      const gps = await refreshGps();
      if (!gps) {
        setError('현재 위치를 가져오지 못했습니다. 권한을 확인해 주세요.');
        return;
      }
      router.back();
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.text} />
        <TextInput
          style={styles.input}
          placeholder="동네, 지하철역, 주소 검색"
          placeholderTextColor={
            focused || query.length > 0 ? 'transparent' : colors.textMuted
          }
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          returnKeyType="search"
          underlineColorAndroid="transparent"
          importantForAutofill="no"
        />
      </View>

      <Pressable style={styles.gpsRow} onPress={() => void useGps()}>
        {gpsLoading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <View style={styles.gpsContent}>
            <Ionicons name="locate-outline" size={20} color={colors.text} />
            <Text style={styles.gpsLabel}>현재 GPS 위치로 설정</Text>
          </View>
        )}
      </Pressable>

      <Pressable style={styles.gpsRow} onPress={() => setMapOpen(true)}>
        <View style={styles.gpsContent}>
          <Ionicons name="map-outline" size={20} color={colors.text} />
          <Text style={styles.gpsLabel}>지도에서 위치 선택</Text>
        </View>
      </Pressable>

      {searching ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 24 }} />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          canSearch && !searching && !error ? (
            <Text style={styles.empty}>검색 결과가 없습니다.</Text>
          ) : (
            <View />
          )
        }
        renderItem={({ item }) => (
          <Pressable style={styles.result} onPress={() => void selectResult(item)}>
            <Text style={styles.resultName}>{item.name}</Text>
            <Text style={styles.resultAddress}>{item.address}</Text>
          </Pressable>
        )}
      />

      <LocationMapPicker
        visible={mapOpen}
        initialLat={location?.lat ?? DEFAULT_LOCATION.lat}
        initialLng={location?.lng ?? DEFAULT_LOCATION.lng}
        onClose={() => setMapOpen(false)}
        onConfirm={async (lat, lng, address) => {
          await setManualLocation(lat, lng, address);
          setMapOpen(false);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.md,
  },
  searchBox: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    margin: 0,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlignVertical: 'center',
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
      default: {},
    }),
  },
  gpsRow: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  gpsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gpsLabel: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 15,
  },
  result: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultName: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 15,
  },
  resultAddress: {
    ...typography.caption,
    marginTop: 2,
  },
  empty: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 32,
  },
  error: {
    fontFamily: fonts.regular,
    color: colors.danger,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
});
