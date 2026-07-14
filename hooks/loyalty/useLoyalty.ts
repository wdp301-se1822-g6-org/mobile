import { loyaltyService } from '@/services/loyalty.service';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export const LOYALTY_KEY = ['loyalty'] as const;
export const LOYALTY_TRANSACTIONS_KEY = ['loyalty-transactions'] as const;

export function useLoyaltyAccount() {
  const query = useQuery({
    queryKey: LOYALTY_KEY,
    queryFn: loyaltyService.getLoyaltyAccount,
  });

  useFocusEffect(
    useCallback(() => {
      void query.refetch();
    }, [query.refetch]),
  );

  return query;
}

export function useLoyaltyTransactions(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...LOYALTY_TRANSACTIONS_KEY, page, limit],
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
