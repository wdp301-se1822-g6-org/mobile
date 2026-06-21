import { SharedValue, withSpring } from 'react-native-reanimated';

export const springConfig = { damping: 18, stiffness: 200 };

export function pressHandlers(scale: SharedValue<number>) {
  return {
    onPressIn: () => { scale.value = withSpring(0.97, springConfig); },
    onPressOut: () => { scale.value = withSpring(1, springConfig); },
  };
}
