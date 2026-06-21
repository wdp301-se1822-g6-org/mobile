export type TierName = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

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
