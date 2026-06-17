import { Colors } from '@/constants/Colors';
import { TierName } from '@/types/loyalty';
import { Text, View } from 'react-native';

const TIER_MAP: Record<TierName, { label: string; color: string; bg: string }> = {
  none:     { label: 'Chưa có',  color: Colors.textSecondary, bg: '#F3F4F6' },
  bronze:   { label: 'Đồng',     color: Colors.bronze,   bg: '#FDF3E7' },
  silver:   { label: 'Bạc',      color: Colors.silver,   bg: '#F1F5F9' },
  gold:     { label: 'Vàng',     color: Colors.gold,     bg: '#FFFBEB' },
  platinum: { label: 'Bạch Kim', color: Colors.platinum, bg: '#EEF2FF' },
};

export function TierBadge({ tier, size = 'md' }: { tier: TierName; size?: 'sm' | 'md' }) {
  const { label, color, bg } = TIER_MAP[tier] ?? TIER_MAP.bronze;
  const px = size === 'sm' ? 8 : 12;
  const py = size === 'sm' ? 2 : 4;
  const fs = size === 'sm' ? 11 : 13;

  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: px, paddingVertical: py }}>
      <Text style={{ color, fontSize: fs, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
