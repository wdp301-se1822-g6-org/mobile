import { API } from '@/constants/endpoints';
import { LoyaltyAccount, LoyaltyTransactionList, TierConfig } from '@/types/loyalty';
import { axiosInstance } from './api';

export const loyaltyService = {
  getLoyaltyAccount: () =>
    axiosInstance.get<LoyaltyAccount>(API.me.loyalty).then((r) => ({
      ...r.data,
      tierName: (r.data.tierName ?? 'none').toLowerCase() as LoyaltyAccount['tierName'],
      pointsBalance: r.data.pointsBalance ?? 0,
      totalSuccessfulWashes: r.data.totalSuccessfulWashes ?? 0,
    })),

  getLoyaltyTransactions: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get<LoyaltyTransactionList>(API.me.loyaltyTransactions, { params }).then((r) => r.data),

  getTierConfigs: () =>
    axiosInstance.get<TierConfig[]>(API.tierConfigs).then((r) => r.data),
};
