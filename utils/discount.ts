import type { TranslationKey } from '@/i18n/useT';

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

const TIER_LABEL_KEY: Record<string, TranslationKey> = {
  basic:  'loyalty.tierBasic',
  bronze: 'loyalty.tierBronze',
  silver: 'loyalty.tierSilver',
  gold:   'loyalty.tierGold',
};

/**
 * The API returns machine-ish reasons like "golden_hour: giờ vàng + tier:None".
 * Renders them as "Giảm giá khung giờ vàng - hạng Đồng"; tiers with no discount
 * (None) are dropped rather than shown to the customer.
 */
export function describeDiscountReason(reason: string | undefined, t: Translate): string {
  const base = t('bookingDetail.discount');
  const parts: string[] = [];

  for (const chunk of (reason ?? '').split('+')) {
    const piece = chunk.trim();
    if (!piece) continue;

    const sep = piece.indexOf(':');
    const key = (sep === -1 ? piece : piece.slice(0, sep)).trim().toLowerCase().replace(/[\s-]+/g, '_');
    const value = sep === -1 ? '' : piece.slice(sep + 1).trim();

    if (key === 'golden_hour' || key === 'goldenhour') {
      parts.push(t('bookingDetail.discountGoldenHour'));
    } else if (key === 'tier' || key === 'loyalty_tier') {
      const labelKey = TIER_LABEL_KEY[value.toLowerCase()];
      if (labelKey) parts.push(t('bookingDetail.discountTier', { tier: t(labelKey) }));
    } else if (key === 'voucher') {
      parts.push(t('bookingDetail.discountVoucher', { code: value }).trim());
    } else if (value) {
      parts.push(value);
    } else {
      parts.push(piece.replace(/_/g, ' '));
    }
  }

  return parts.length ? `${base} ${parts.join(' - ')}` : base;
}
