export type TierName = 'basic' | 'bronze' | 'silver' | 'gold';

export const TIER_NAMES: TierName[] = ['basic', 'bronze', 'silver', 'gold'];

/** Free-wash voucher threshold; the API does not expose it per tier. */
export const WASHES_PER_VOUCHER = 10;

/** The API still sends legacy values such as "None"; anything unknown is the entry tier. */
export function normalizeTier(value?: string | null): TierName {
  const name = (value ?? '').trim().toLowerCase();
  return TIER_NAMES.includes(name as TierName) ? (name as TierName) : 'basic';
}

export type LoyaltyAccount = {
  id: string;
  customerId: string;
  tierConfigId: string;
  tierName: TierName;
  pointsBalance: number;
  successfulWashesTowardVoucher: number;
  totalSuccessfulWashes: number;
  lastAnnualResetAt: string;
};

export type LoyaltyTransaction = {
  id: string;
  customerId: string;
  type: string;
  pointsDelta: number;
  balanceAfter: number;
  orderId: string | null;
  voucherId: string | null;
  previousTierConfigId: string | null;
  newTierConfigId: string | null;
  reason: string;
  createdAt: string;
};

export type TierConfig = {
  id: string;
  tierName: TierName;
  minLoyaltyPoints: number;
  bookingWindowDays: number;
  priorityLevel: number;
  pointsPer1000Vnd: number;
  discountPercent: number;
  isActive: boolean;
};

export type LoyaltyTransactionList = {
  data: LoyaltyTransaction[];
  meta: Record<string, unknown>;
};
