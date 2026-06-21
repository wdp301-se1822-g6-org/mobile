import { Colors } from '@/constants/Colors';
import { TierName } from '@/types/loyalty';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const TIER_COLORS: Record<TierName, string> = {
  none: Colors.textDisabled,
  bronze: Colors.bronze,
  silver: Colors.silver,
  gold: Colors.gold,
  platinum: Colors.platinum,
};

type Props = {
  currentPoints: number;
  minPoints: number;
  maxPoints: number;
  currentTier: TierName;
  nextTier?: TierName;
};

export function TierProgressBar({ currentPoints, minPoints, maxPoints, currentTier, nextTier }: Props) {
  const range = maxPoints - minPoints;
  const progress = range <= 0 ? 1 : Math.min((currentPoints - minPoints) / range, 1);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 800 });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%` as `${number}%`,
  }));

  const color = TIER_COLORS[currentTier];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
          {(currentPoints ?? 0).toLocaleString()} điểm
        </Text>
        {nextTier && (
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
            {(maxPoints ?? 0).toLocaleString()} điểm → {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}
          </Text>
        )}
      </View>
      <View style={{ height: 8, backgroundColor: Colors.border, borderRadius: 999, overflow: 'hidden' }}>
        <Animated.View style={[barStyle, { height: '100%', backgroundColor: color, borderRadius: 999 }]} />
      </View>
    </View>
  );
}
