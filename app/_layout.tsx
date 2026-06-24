import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import '../global.css';

const queryClient = new QueryClient();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: 'index' };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(washer)" />
        <Stack.Screen name="booking/[id]" />
        <Stack.Screen name="booking/new" />
        <Stack.Screen name="booking/reschedule" />
        <Stack.Screen name="vehicles/index" />
        <Stack.Screen name="vehicles/new" />
        <Stack.Screen name="vouchers/index" />
        <Stack.Screen name="loyalty/transactions" />
        <Stack.Screen name="chat/index" />
        <Stack.Screen name="work-order/[id]" />
        <Stack.Screen name="feedback/[orderId]" />
        <Stack.Screen name="profile" />
      </Stack>
      <Toast />
    </QueryClientProvider>
  );
}
