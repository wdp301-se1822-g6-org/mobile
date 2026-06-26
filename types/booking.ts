export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type PaymentMethod = 'cash' | 'online';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type Order = {
  id: string;
  customerId: string;
  serviceTypeId: string;
  serviceName: string;
  vehicleId: string;
  licensePlate: string;
  vehicleTypeName?: string;
  staffShiftId?: string;
  scheduledAt: string;
  estimatedMinutes?: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amount: number;
  originalAmount: number;
  discountAmount: number;
  discountPercent?: number;
  discountReason?: string;
  voucherId?: string;
  priorityLevel?: number;
  rescheduleCount?: number;
  cancelReason?: string;
  note?: string;
  payosCheckoutUrl?: string;
  payosOrderCode?: number;
  createdAt: string;
  updatedAt?: string;
};

export type CreateOrderDto = {
  serviceTypeId: string;
  vehicleId?: string;
  vehicle?: { vehicleTypeId: string; licensePlate: string };
  scheduledAt: string;
  voucherId?: string;
  paymentMethod: PaymentMethod;
};

export type RescheduleOrderDto = { scheduledAt: string };

export type PreviewOrderDto = {
  serviceTypeId: string;
  vehicleTypeId: string;
  scheduledAt: string;
  voucherId?: string;
};

export type PreviewOrderResponse = {
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  appliedDiscounts: { label: string; amount: number }[];
};

export type AvailableSlot = {
  scheduledAt: string;
  remainingCapacity: number;
  isGoldenHour: boolean;
  discountPercent: number;
};
