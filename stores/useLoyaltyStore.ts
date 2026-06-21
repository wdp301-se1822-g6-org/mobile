import { LoyaltyAccount, TierConfig } from '@/types/loyalty';
import { create } from 'zustand';

type LoyaltyState = {
  account: LoyaltyAccount | null;
  tierConfigs: TierConfig[];
  setAccount: (account: LoyaltyAccount | null) => void;
  setTierConfigs: (configs: TierConfig[]) => void;
};

export const useLoyaltyStore = create<LoyaltyState>((set) => ({
  account: null,
  tierConfigs: [],
  setAccount: (account) => set({ account }),
  setTierConfigs: (tierConfigs) => set({ tierConfigs }),
}));
