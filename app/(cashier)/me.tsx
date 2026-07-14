import { Colors } from '@/constants/Colors';
import { useLogout } from '@/hooks/auth/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { Alert, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CashierMeScreen() {
  const { authUser } = useAuthStore();
  const { mutate: logout } = useLogout();

  const initials = authUser?.name
    ? authUser.name
        .split(' ')
        .map((w) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : '?';

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () =>
          logout(undefined, {
            onSettled: () => router.replace('/(auth)/welcome'),
          }),
      },
    ]);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <View style={{ padding: 16 }}>
        <Text
          style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}
        >
          Tôi
        </Text>
      </View>
      <Pressable onPress={() => router.push('/profile')} style={{ padding: 8 }}>
        {/* Profile card */}
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            marginHorizontal: 16,
            backgroundColor: Colors.surface,
            borderRadius: 20,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: Colors.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{ fontSize: 22, fontWeight: '700', color: Colors.primary }}
            >
              {initials}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: Colors.textPrimary,
              }}
            >
              {authUser?.name}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: Colors.textSecondary,
                marginTop: 2,
              }}
            >
              {authUser?.email}
            </Text>
            <View
              style={{
                marginTop: 6,
                alignSelf: 'flex-start',
                backgroundColor: Colors.primaryLight,
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: Colors.primary,
                }}
              >
                Thu ngân
              </Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>

      {/* Logout */}
      <Animated.View
        entering={FadeInDown.delay(60).springify()}
        style={{ marginHorizontal: 16 }}
      >
        <Pressable
          onPress={handleLogout}
          style={{
            backgroundColor: '#FEF2F2',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <LogOut size={18} color={Colors.danger} strokeWidth={1.5} />
          <Text
            style={{ fontSize: 14, fontWeight: '600', color: Colors.danger }}
          >
            Đăng xuất
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
