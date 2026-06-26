import { cashierService, CheckInDto, OrderQuery } from '@/services/cashier.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const CASHIER_ORDERS_KEY = ['cashier-orders'] as const;

// Backend chạy serverless (Vercel) nên không có socket — dùng polling để gần realtime.
// Chỉ poll khi app đang foreground để tiết kiệm pin/dữ liệu.
const POLL_INTERVAL = 4000;

export function useCashierOrders(params?: OrderQuery) {
  return useQuery({
    queryKey: [...CASHIER_ORDERS_KEY, params ?? {}],
    queryFn: () => cashierService.getOrders(params),
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useCashierOrder(id: string) {
  return useQuery({
    queryKey: ['cashier-orders', id],
    queryFn: () => cashierService.getOrder(id),
    enabled: !!id,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useWorkOrderByOrder(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ['cashier-work-order-by-order', orderId],
    queryFn: () => cashierService.getWorkOrderByOrder(orderId),
    enabled: !!orderId && enabled,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CheckInDto) => cashierService.checkIn(dto),
    onSuccess: (_, dto) => {
      qc.invalidateQueries({ queryKey: CASHIER_ORDERS_KEY });
      qc.invalidateQueries({ queryKey: ['cashier-orders', dto.orderId] });
    },
  });
}
