import type { ParamListBase, StackNavigationState } from '@react-navigation/native';
import {
  createStackNavigator,
  type StackNavigationEventMap,
  type StackNavigationOptions,
} from '@react-navigation/stack';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createStackNavigator();

// expo-router <Stack> dùng @react-navigation/native-stack, ở đó gestureEnabled bị
// đánh dấu @platform ios và bị bỏ qua hoàn toàn trên Android (native-stack map
// xuống UINavigationController của iOS, Android không có API tương đương).
// JS Stack chạy gesture bằng gesture-handler + Reanimated nên vuốt back hoạt động
// giống nhau trên cả hai nền tảng.
export const GestureStack = withLayoutContext<
  StackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  StackNavigationEventMap
>(Navigator);
