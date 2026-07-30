import { SwipeTabBar, TAB_ICON_SIZE } from '@/components/navigation/SwipeTabBar';
import { SwipeTabs } from '@/components/navigation/SwipeTabs';
import { useT } from '@/i18n/useT';
import { CalendarCheck, Home, User } from 'lucide-react-native';

export default function TabLayout() {
  const t = useT();

  // animationEnabled chỉ chi phối lúc đổi tab bằng code (setPage vs
  // setPageWithoutAnimation). Tắt đi thì bấm tab là nhảy thẳng, còn vuốt tay vẫn
  // do pager xử lý ở tầng native nên không bị ảnh hưởng.
  return (
    <SwipeTabs
      tabBarPosition="bottom"
      tabBar={(props) => <SwipeTabBar {...props} />}
      screenOptions={{ swipeEnabled: true, animationEnabled: false }}
    >
      <SwipeTabs.Screen
        name="home"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color }) => <Home size={TAB_ICON_SIZE} color={color} strokeWidth={1.5} />,
        }}
      />
      <SwipeTabs.Screen
        name="bookings"
        options={{
          title: t('nav.bookings'),
          tabBarIcon: ({ color }) => (
            <CalendarCheck size={TAB_ICON_SIZE} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <SwipeTabs.Screen
        name="me"
        options={{
          title: t('nav.me'),
          tabBarIcon: ({ color }) => <User size={TAB_ICON_SIZE} color={color} strokeWidth={1.5} />,
        }}
      />
    </SwipeTabs>
  );
}
