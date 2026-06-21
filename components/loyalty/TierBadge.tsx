import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { TierName } from '@/types/loyalty';
import { Text, View } from 'react-native';

const TIER_STYLE: Record<TierName, { color: string; bg: string }> = {
  none:     { color: Colors.textSecondary, bg: '#F3F4F6' },
  bronze:   { color: Colors.bronze,        bg: '#FDF3E7' },
  silver:   { color: Colors.silver,        bg: '#F1F5F9' },
  gold:     { color: Colors.gold,          bg: '#FFFBEB' },
  platinum: { color: Colors.platinum,      bg: '#EEF2FF' },
};

const TIER_KEY: Record<TierName, string> = {
  none:     'loyalty.tierNone',
  bronze:   'loyalty.tierBronze',
  silver:   'loyalty.tierSilver',
  gold:     'loyalty.tierGold',
  platinum: 'loyalty.tierPlatinum',
};

export function TierBadge({ tier, size = 'md' }: { tier: TierName; size?: 'sm' | 'md' }) {
  const t = useT();
  const { color, bg } = TIER_STYLE[tier] ?? TIER_STYLE.bronze;
  const px = size === 'sm' ? 8 : 12;
  const py = size === 'sm' ? 2 : 4;
  const fs = size === 'sm' ? 11 : 13;

  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: px, paddingVertical: py }}>
      <Text style={{ color, fontSize: fs, fontWeight: '700' }}>{t(TIER_KEY[tier] as any)}</Text>
    </View>
  );
}
