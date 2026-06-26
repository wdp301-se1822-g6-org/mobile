import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import '../global.css';

const queryClient = new QueryClient();

// Cho React Query biết app đang foreground hay background (RN không tự biết).
// Nhờ vậy polling tạm dừng khi vào background và tự refetch khi quay lại.
function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === 'active');
}

// Cầu nối realtime: phải nằm BÊN TRONG QueryClientProvider để dùng useQueryClient.
function RealtimeBridge() {
  useRealtimeSync();
  return null;
}

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: 'index' };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, []);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeBridge />
      <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(washer)" />
        <Stack.Screen name="(cashier)" />
        <Stack.Screen name="check-in/[id]" />
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
