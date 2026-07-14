import { cashierService, CheckInDto, OrderQuery } from '@/services/cashier.service';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const CASHIER_ORDERS_KEY = ['cashier-orders'] as const;

// Realtime do socket lo (useRealtimeSync invalidate các key bên dưới), không poll theo interval.

export function useCashierOrders(params?: OrderQuery) {
  return useQuery({
    queryKey: [...CASHIER_ORDERS_KEY, params ?? {}],
    queryFn: () => cashierService.getOrders(params),
    // Đổi tab filter -> key mới: giữ data cũ để không chớp loading toàn màn hình.
    placeholderData: keepPreviousData,
  });
}

export function useCashierOrder(id: string) {
  return useQuery({
    queryKey: ['cashier-orders', id],
    queryFn: () => cashierService.getOrder(id),
    enabled: !!id,
  });
}

export function useWorkOrderByOrder(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ['cashier-work-order-by-order', orderId],
    queryFn: () => cashierService.getWorkOrderByOrder(orderId),
    enabled: !!orderId && enabled,
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
