import { pressHandlers } from '@/utils/animations';
import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Pressable } from 'react-native';

type Props = {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

export function PressableCard({ onPress, children, style, className }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        className={className}
        style={style}
        {...pressHandlers(scale)}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
