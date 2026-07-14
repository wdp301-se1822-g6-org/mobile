import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { Tabs } from 'expo-router';
import { ClipboardList, ListOrdered, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WasherLayout() {
  const { bottom } = useSafeAreaInsets();
  const user = useAuthStore((s) => s.authUser);

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
        name="queue"
        options={{
          title: 'Hàng chờ',
          tabBarIcon: ({ color, size }) => (
            <ListOrdered size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-orders"
        options={{
          title: 'Của tôi',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Tôi',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}
