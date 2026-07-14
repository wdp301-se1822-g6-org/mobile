import { Colors } from '@/constants/Colors';
import { useT, type TranslationKey } from '@/i18n/useT';
import { normalizeTier, TierName } from '@/types/loyalty';
import { Text, View } from 'react-native';

const TIER_STYLE: Record<TierName, { color: string; bg: string }> = {
  basic:  { color: Colors.textSecondary, bg: '#F3F4F6' },
  bronze: { color: Colors.bronze,        bg: '#FDF3E7' },
  silver: { color: Colors.silver,        bg: '#F1F5F9' },
  gold:   { color: Colors.gold,          bg: '#FFFBEB' },
};

const TIER_KEY: Record<TierName, TranslationKey> = {
  basic:  'loyalty.tierBasic',
  bronze: 'loyalty.tierBronze',
  silver: 'loyalty.tierSilver',
  gold:   'loyalty.tierGold',
};

export function TierBadge({ tier, size = 'md' }: { tier: TierName; size?: 'sm' | 'md' }) {
  const t = useT();
  const safeTier = normalizeTier(tier);
  const { color, bg } = TIER_STYLE[safeTier];
  const px = size === 'sm' ? 8 : 12;
  const py = size === 'sm' ? 2 : 4;
  const fs = size === 'sm' ? 11 : 13;

  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: px, paddingVertical: py }}>
      <Text style={{ color, fontSize: fs, fontWeight: '700' }}>{t(TIER_KEY[safeTier])}</Text>
    </View>
  );
}
