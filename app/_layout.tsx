import { GestureStack } from '@/components/navigation/GestureStack';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useAuthStore } from '@/stores/useAuthStore';
import { TransitionPresets } from '@react-navigation/stack';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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

// Interceptor trong services/api.ts gọi logout() khi refresh token hết hạn, nhưng nó
// chạy ngoài React nên không điều hướng được — user bị mất session mà vẫn đứng nguyên
// màn đang xem. Guard này mount một lần ở root nên bắt được mọi route, kể cả các màn
// push ngoài group như booking/[id] hay chat.
function AuthGuard() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const segments = useSegments();

  useEffect(() => {
    if (!isInitialized || isLoggedIn) return;
    // Không có segment nào = đang ở app/index.tsx, màn đó tự <Redirect> theo role.
    const [group] = segments;
    if (!group || group === '(auth)') return;
    router.replace('/(auth)/welcome');
  }, [isInitialized, isLoggedIn, segments]);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RealtimeBridge />
        <AuthGuard />
        <GestureStack
          screenOptions={{
            headerShown: false,
            // JS Stack mặc định tắt gesture trên Android — phải bật tay.
            gestureEnabled: true,
            ...TransitionPresets.SlideFromRightIOS,
          }}
        >
          <GestureStack.Screen name="index" options={{ gestureEnabled: false }} />
          {/* Logout điều hướng về đây bằng router.replace. Để nguyên animation thì
              màn cũ còn trượt ~500ms (SlideFromRightIOS là spring, không phải
              timing), trong khi useLogout xoá store ở mốc 400ms — user kịp thấy
              avatar lật thành "?" giữa lúc trượt. Bỏ animation là hết cửa sổ đó,
              khỏi phải canh LOGOUT_TEARDOWN_DELAY_MS theo đường cong spring.
              Vào welcome cũng là reset phiên, không nên trượt như đi tới. */}
          <GestureStack.Screen
            name="(auth)"
            options={{ gestureEnabled: false, animation: 'none' }}
          />
          {/* Ba nhóm tab tự bắt vuốt ngang bằng pager. Bật gesture ở tầng Stack
              nữa thì hai bên tranh nhau cùng một cú kéo. */}
          <GestureStack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          <GestureStack.Screen name="(washer)" options={{ gestureEnabled: false }} />
          <GestureStack.Screen name="(cashier)" options={{ gestureEnabled: false }} />
          <GestureStack.Screen name="check-in/[id]" />
          <GestureStack.Screen name="booking/[id]" />
          <GestureStack.Screen name="booking/new" />
          <GestureStack.Screen name="booking/reschedule" />
          <GestureStack.Screen name="vehicles/index" />
          <GestureStack.Screen name="vehicles/new" />
          <GestureStack.Screen name="vouchers/index" />
          <GestureStack.Screen name="loyalty/index" />
          <GestureStack.Screen name="loyalty/transactions" />
          <GestureStack.Screen name="schedule" />
          <GestureStack.Screen name="chat/index" />
          <GestureStack.Screen name="work-order/[id]" />
          <GestureStack.Screen name="feedback/[orderId]" />
          <GestureStack.Screen name="profile" />
        </GestureStack>
        <Toast />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
