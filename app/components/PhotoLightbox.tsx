import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { foodTruckIcon } from '../constants/images';
import { androidFont, colors, fonts } from '../constants/theme';

interface Props {
  visible: boolean;
  urls: string[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** 사진 클릭 시 전체화면 상세 — 좌우 스와이프로 전체 사진 탐색 */
export function PhotoLightbox({
  visible,
  urls,
  initialIndex = 0,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<string>>(null);
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible || urls.length === 0) return;
    const safe = Math.min(Math.max(0, initialIndex), urls.length - 1);
    setIndex(safe);
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: safe, animated: false });
    });
  }, [visible, initialIndex, urls.length]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) setIndex(first.index);
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  if (urls.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
          <Text style={styles.counter}>
            {index + 1} / {urls.length}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={styles.closeBtn}
            accessibilityLabel="닫기"
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={urls}
          keyExtractor={(item, i) => `${item}-${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={Math.min(initialIndex, urls.length - 1)}
          getItemLayout={(_, i) => ({
            length: SCREEN_W,
            offset: SCREEN_W * i,
            index: i,
          })}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
              });
            }, 50);
          }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const next = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
            if (next >= 0 && next < urls.length) setIndex(next);
          }}
          renderItem={({ item }) => (
            <View style={styles.page}>
              <Image
                source={item ? { uri: item } : foodTruckIcon}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}
        />

        <View
          style={[styles.dots, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          {urls.map((_, i) => (
            <View
              key={`dot-${i}`}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 2,
  },
  counter: {
    fontFamily: fonts.medium,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    ...androidFont,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  page: {
    width: SCREEN_W,
    height: SCREEN_H * 0.72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_W,
    height: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
