import { SwipeTabBar, TAB_ICON_SIZE } from '@/components/navigation/SwipeTabBar';
import { SwipeTabs } from '@/components/navigation/SwipeTabs';
import { ClipboardList, ListOrdered, User } from 'lucide-react-native';

export default function WasherLayout() {
  return (
    <SwipeTabs
      tabBarPosition="bottom"
      tabBar={(props) => <SwipeTabBar {...props} />}
      screenOptions={{ swipeEnabled: true, animationEnabled: false }}
    >
      <SwipeTabs.Screen
        name="queue"
        options={{
          title: 'Hàng chờ',
          tabBarIcon: ({ color }) => (
            <ListOrdered size={TAB_ICON_SIZE} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <SwipeTabs.Screen
        name="my-orders"
        options={{
          title: 'Của tôi',
          tabBarIcon: ({ color }) => (
            <ClipboardList size={TAB_ICON_SIZE} color={color} strokeWidth={1.5} />
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
