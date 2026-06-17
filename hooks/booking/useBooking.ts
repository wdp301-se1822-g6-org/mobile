import { bookingService } from '@/services/booking.service';
import { CreateOrderDto, RescheduleOrderDto } from '@/types/booking';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const ORDERS_KEY = ['orders'] as const;

export function useOrders() {
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: bookingService.getOrders,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => bookingService.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrderDto) => bookingService.createOrder(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}

export function usePreviewOrder() {
  return useMutation({
    mutationFn: bookingService.previewOrder,
  });
}

export function useAvailableSlots(params: { serviceTypeId: string; vehicleTypeId: string; from: string; to: string } | null) {
  return useQuery({
    queryKey: ['slots', params],
    queryFn: () => bookingService.getAvailableSlots(params!),
    enabled: !!params,
  });
}

export function useRescheduleOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RescheduleOrderDto }) =>
      bookingService.rescheduleOrder(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ORDERS_KEY });
      qc.invalidateQueries({ queryKey: ['orders', id] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingService.cancelOrder(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ORDERS_KEY });
      qc.invalidateQueries({ queryKey: ['orders', id] });
    },
  });
}
