import { API } from '@/constants/endpoints';
import { AvailableSlot, CreateOrderDto, Order, PreviewOrderDto, PreviewOrderResponse, RescheduleOrderDto } from '@/types/booking';
import { axiosInstance } from './api';

export const bookingService = {
  getOrders: () =>
    axiosInstance.get<Order[]>(API.me.orders).then((r) => r.data),

  getOrder: (id: string) =>
    axiosInstance.get<Order>(API.me.order(id)).then((r) => r.data),

  createOrder: (dto: CreateOrderDto) =>
    axiosInstance.post<Order>(API.me.orders, dto).then((r) => r.data),

  previewOrder: (dto: PreviewOrderDto) =>
    axiosInstance.post<PreviewOrderResponse>(API.me.orderPreview, dto).then((r) => r.data),

  getAvailableSlots: (params: { serviceTypeId: string; vehicleTypeId: string; from: string; to: string }) =>
    axiosInstance.get<AvailableSlot[]>(API.me.orderSlots, { params }).then((r) => r.data),

  rescheduleOrder: (id: string, dto: RescheduleOrderDto) =>
    axiosInstance.patch<Order>(API.me.orderReschedule(id), dto).then((r) => r.data),

  cancelOrder: (id: string) =>
    axiosInstance.patch<Order>(API.me.orderCancel(id)).then((r) => r.data),
};
