import { loyaltyService } from '@/services/loyalty.service';
import { useQuery } from '@tanstack/react-query';

export function useLoyaltyAccount() {
  return useQuery({
    queryKey: ['loyalty'],
    queryFn: loyaltyService.getLoyaltyAccount,
  });
}

export function useLoyaltyTransactions(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['loyalty-transactions', page, limit],
    queryFn: () => loyaltyService.getLoyaltyTransactions({ page, limit }),
  });
}

export function useTierConfigs() {
  return useQuery({
    queryKey: ['tier-configs'],
    queryFn: loyaltyService.getTierConfigs,
    staleTime: 5 * 60 * 1000,
  });
}
