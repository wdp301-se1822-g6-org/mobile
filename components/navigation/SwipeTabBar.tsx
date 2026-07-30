import { Colors } from '@/constants/Colors';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_ICON_SIZE = 24;

// material-top-tabs vẽ thanh tab kiểu Material (gạch chân, chữ hoa) nên không dùng
// được mặc định. Đây là bản dựng lại thanh tab cũ của bottom-tabs — giữ nguyên
// màu, chiều cao và cỡ chữ để giao diện không đổi.
export function SwipeTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        height: 56 + bottom,
        paddingBottom: 8 + bottom,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused ? Colors.primary : Colors.textDisabled;
        const label = options.title ?? route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}
          >
            {options.tabBarIcon?.({ focused, color })}
            <Text style={{ fontSize: 11, fontWeight: '500', color }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
