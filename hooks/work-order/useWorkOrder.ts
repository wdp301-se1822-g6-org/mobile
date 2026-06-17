import { workOrderService } from '@/services/work-order.service';
import { FinishWorkOrderDto } from '@/types/work-order';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const WORK_ORDERS_KEY = ['work-orders'] as const;

export function useMyWorkOrders() {
  return useQuery({
    queryKey: WORK_ORDERS_KEY,
    queryFn: workOrderService.getMyWorkOrders,
  });
}

export function useMyWorkOrder(id: string) {
  return useQuery({
    queryKey: ['work-orders', id],
    queryFn: () => workOrderService.getMyWorkOrder(id),
    enabled: !!id,
  });
}

export function useStartWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workOrderService.startWorkOrder(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: WORK_ORDERS_KEY });
      qc.invalidateQueries({ queryKey: ['work-orders', id] });
    },
  });
}

export function useFinishWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: FinishWorkOrderDto }) =>
      workOrderService.finishWorkOrder(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: WORK_ORDERS_KEY });
      qc.invalidateQueries({ queryKey: ['work-orders', id] });
    },
  });
}
