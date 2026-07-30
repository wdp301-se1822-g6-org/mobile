import { SwipeTabBar, TAB_ICON_SIZE } from '@/components/navigation/SwipeTabBar';
import { SwipeTabs } from '@/components/navigation/SwipeTabs';
import { ScanLine, User } from 'lucide-react-native';

export default function CashierLayout() {
  return (
    <SwipeTabs
      tabBarPosition="bottom"
      tabBar={(props) => <SwipeTabBar {...props} />}
      screenOptions={{ swipeEnabled: true, animationEnabled: false }}
    >
      <SwipeTabs.Screen
        name="check-in"
        options={{
          title: 'Check-in',
          tabBarIcon: ({ color }) => (
            <ScanLine size={TAB_ICON_SIZE} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <SwipeTabs.Screen
        name="me"
        options={{
          title: 'Tôi',
          tabBarIcon: ({ color }) => <User size={TAB_ICON_SIZE} color={color} strokeWidth={1.5} />,
        }}
      />
    </SwipeTabs>
  );
}
