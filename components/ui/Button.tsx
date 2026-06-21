import { Colors } from '@/constants/Colors';
import { pressHandlers } from '@/utils/animations';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

const styles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: Colors.white },
  secondary: { bg: Colors.white, text: Colors.primary, border: Colors.primary },
  ghost: { bg: 'transparent', text: Colors.textSecondary },
  danger: { bg: Colors.danger, text: Colors.white },
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, className }: Props) {
  const scale = useSharedValue(1);
  const s = styles[variant];
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;

  return (
    <Animated.View style={animStyle} className={className}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        {...pressHandlers(scale)}
        style={{
          backgroundColor: s.bg,
          borderWidth: s.border ? 1.5 : 0,
          borderColor: s.border,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: 'center',
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={s.text} />
        ) : (
          <Text style={{ color: s.text, fontWeight: '600', fontSize: 15 }}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
