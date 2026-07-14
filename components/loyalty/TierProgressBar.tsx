import { Colors } from '@/constants/Colors';
import { normalizeTier, TierName } from '@/types/loyalty';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const TIER_COLORS: Record<TierName, string> = {
  basic: Colors.textDisabled,
  bronze: Colors.bronze,
  silver: Colors.silver,
  gold: Colors.gold,
};

type Props = {
  currentPoints: number;
  minPoints: number;
  maxPoints: number;
  currentTier: TierName;
  nextTier?: TierName;
};

export function TierProgressBar({
  currentPoints,
  minPoints,
  maxPoints,
  currentTier,
  nextTier,
}: Props) {
  const range = maxPoints - minPoints;
  const progress =
    range <= 0 ? 1 : Math.min((currentPoints - minPoints) / range, 1);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 800 });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%` as `${number}%`,
  }));

  const color = TIER_COLORS[normalizeTier(currentTier)];

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.white }}>
          {(currentPoints ?? 0).toLocaleString()} điểm
        </Text>
        {nextTier && (
          <Text
            style={{ fontSize: 12, fontWeight: '600', color: Colors.white }}
          >
            {(maxPoints ?? 0).toLocaleString()} điểm →{' '}
            {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}
          </Text>
        )}
      </View>
      <View
        style={{
          height: 8,
          backgroundColor: Colors.white,
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            barStyle,
            { height: '100%', backgroundColor: Colors.gold, borderRadius: 999 },
          ]}
        />
      </View>
    </View>
  );
}
