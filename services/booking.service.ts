import { API } from '@/constants/endpoints';
import { AvailableSlot, CreateOrderDto, Order, PreviewOrderDto, PreviewOrderResponse, RescheduleOrderDto } from '@/types/booking';
import { axiosInstance } from './api';

// Money comes back as strings, and the API names an order's amounts
// originalAmount/amount — accept those alongside basePrice/finalPrice so a naming
// mismatch cannot silently drop the discount from the total.
type Money = string | number | undefined;
type RawPreviewOrderResponse = {
  basePrice?: Money;
  originalAmount?: Money;
  discountAmount?: Money;
  finalPrice?: Money;
  amount?: Money;
  appliedDiscounts?: { label: string; amount: Money }[];
};

const money = (v: Money): number => Number(v) || 0;

const normalizePreview = (r: RawPreviewOrderResponse): PreviewOrderResponse => {
  const basePrice = money(r.basePrice ?? r.originalAmount);
  const discountAmount = money(r.discountAmount);
  const rawFinal = r.finalPrice ?? r.amount;
  return {
    basePrice,
    discountAmount,
    // Derive the total only when the API omits it entirely.
    finalPrice: rawFinal != null ? money(rawFinal) : Math.max(basePrice - discountAmount, 0),
    appliedDiscounts: (r.appliedDiscounts ?? []).map((d) => ({ label: d.label, amount: money(d.amount) })),
  };
};

export const bookingService = {
  getOrders: () =>
    axiosInstance.get<Order[]>(API.me.orders).then((r) => r.data),

  getOrder: (id: string) =>
    axiosInstance.get<Order>(API.me.order(id)).then((r) => r.data),

  createOrder: (dto: CreateOrderDto) =>
    axiosInstance.post<Order>(API.me.orders, dto).then((r) => r.data),

  previewOrder: (dto: PreviewOrderDto) =>
    axiosInstance.post<RawPreviewOrderResponse>(API.me.orderPreview, dto).then((r) => normalizePreview(r.data)),

  getAvailableSlots: (params: { serviceTypeId: string; vehicleTypeId: string; from: string; to: string }) =>
    axiosInstance.get<AvailableSlot[]>(API.me.orderSlots, { params }).then((r) => r.data),

  rescheduleOrder: (id: string, dto: RescheduleOrderDto) =>
    axiosInstance.patch<Order>(API.me.orderReschedule(id), dto).then((r) => r.data),

  cancelOrder: (id: string) =>
    axiosInstance.patch<Order>(API.me.orderCancel(id)).then((r) => r.data),
};
