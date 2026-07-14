import { loyaltyService } from '@/services/loyalty.service';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export const LOYALTY_KEY = ['loyalty'] as const;
export const LOYALTY_TRANSACTIONS_KEY = ['loyalty-transactions'] as const;

const TRANSACTIONS_PAGE_SIZE = 20;

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

export function useLoyaltyTransactions(limit = TRANSACTIONS_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: [...LOYALTY_TRANSACTIONS_KEY, limit],
    queryFn: ({ pageParam }) => loyaltyService.getLoyaltyTransactions({ page: pageParam, limit }),
    initialPageParam: 1,
    // `meta` has no documented shape, so a short page is what tells us the history ended.
    getNextPageParam: (last, pages) => (last.data.length < limit ? undefined : pages.length + 1),
    select: (result) => result.pages.flatMap((p) => p.data),
  });
}

export function useTierConfigs() {
  return useQuery({
    queryKey: ['tier-configs'],
    queryFn: loyaltyService.getTierConfigs,
    staleTime: 5 * 60 * 1000,
  });
}
