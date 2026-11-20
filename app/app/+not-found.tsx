import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '페이지 없음' }} />
      <View style={styles.container}>
        <Text style={styles.title}>화면을 찾지 못했어요.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>홈으로</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    color: colors.accent,
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
  },
});
