import { API } from '@/constants/endpoints';
import { axiosInstance } from './api';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AdminOrder = {
  id: string;
  customerName: string;
  customerEmail?: string;
  licensePlate: string;
  serviceName: string;
  scheduledAt: string;
  estimatedMinutes?: number;
  status: OrderStatus;
  paymentMethod?: 'online' | 'cash';
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
  amount?: number;
  assignedWasherName?: string;
  workOrderStatus?: string;
  note?: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type OrderQuery = {
  status?: OrderStatus;
  page?: number;
  limit?: number;
};

export type AdminWorkOrder = {
  id: string;
  orderId: string;
  code: string;
  vehicleSnapshot?: { plate?: string; vehicleTypeName?: string; color?: string };
  serviceName: string;
  scheduledAt: string;
  checkinPhotos: string[];
  checkoutPhotos: string[];
  status: string;
  assignedWasherName?: string;
  stationName?: string;
};

// POST /admin/work-orders — "Check in an order — create a work order"
export type CheckInDto = {
  orderId: string;
  checkinPhotos: string[];
};

export const cashierService = {
  getOrders: (params?: OrderQuery) =>
    axiosInstance.get<Paginated<AdminOrder>>(API.cashier.orders, { params }).then((r) => r.data),

  getOrder: (id: string) =>
    axiosInstance.get<AdminOrder>(API.cashier.order(id)).then((r) => r.data),

  checkIn: (dto: CheckInDto) =>
    axiosInstance.post(API.cashier.workOrders, dto).then((r) => r.data),

  // No "by orderId" endpoint exists, so fetch the list and match locally.
  getWorkOrderByOrder: (orderId: string) =>
    axiosInstance
      .get<Paginated<AdminWorkOrder>>(API.cashier.workOrders, { params: { limit: 100 } })
      .then((r) => r.data.data.find((w) => w.orderId === orderId) ?? null),
};
