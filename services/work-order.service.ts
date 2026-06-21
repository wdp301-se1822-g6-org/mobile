import { API } from '@/constants/endpoints';
import { FinishWorkOrderDto, WorkOrder } from '@/types/work-order';
import { axiosInstance } from './api';

export const workOrderService = {
  getMyWorkOrders: () =>
    axiosInstance.get<WorkOrder[]>(API.me.workOrders).then((r) => r.data),

  getMyWorkOrder: (id: string) =>
    axiosInstance.get<WorkOrder>(API.me.workOrder(id)).then((r) => r.data),

  startWorkOrder: (id: string) =>
    axiosInstance.patch<WorkOrder>(API.me.workOrderStart(id)).then((r) => r.data),

  finishWorkOrder: (id: string, dto: FinishWorkOrderDto) =>
    axiosInstance.patch<WorkOrder>(API.me.workOrderFinish(id), dto).then((r) => r.data),
};
