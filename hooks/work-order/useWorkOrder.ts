import { workOrderService } from '@/services/work-order.service';
import { FinishWorkOrderDto, WorkOrder } from '@/types/work-order';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const WORK_ORDERS_KEY = ['work-orders'] as const;

export function useMyWorkOrders() {
  return useQuery({
    queryKey: WORK_ORDERS_KEY,
    queryFn: workOrderService.getMyWorkOrders,
  });
}

export function useMyWorkOrder(id: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['work-orders', id],
    queryFn: () => workOrderService.getMyWorkOrder(id),
    enabled: !!id,
    initialData: () =>
      qc.getQueryData<WorkOrder[]>(WORK_ORDERS_KEY)?.find((w) => w.id === id),
    placeholderData: () =>
      qc.getQueryData<WorkOrder[]>(WORK_ORDERS_KEY)?.find((w) => w.id === id),
    retry: false,
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
