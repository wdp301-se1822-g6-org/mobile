import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/stores/useAuthStore';
import { Tabs } from 'expo-router';
import { CalendarCheck, Home, Star, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const t = useT();
  const user = useAuthStore((s) => s.authUser);
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textDisabled,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 56 + bottom,
          paddingBottom: 8 + bottom,
          paddingTop: 0,
        },
        tabBarItemStyle: { marginTop: 0 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: t('nav.bookings'),
          tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="loyalty"
        options={{
          title: t('nav.loyalty'),
          tabBarIcon: ({ color, size }) => <Star size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: user?.name?.split(' ').pop() ?? t('nav.me'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}
