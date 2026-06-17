import { API } from '@/constants/endpoints';
import { axiosInstance } from './api';

export type BookingStatus = 'pending_payment' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type WasherScheduleItem = {
  bookingId: string;
  scheduledAt: string;
  status: BookingStatus;
  service: { name: string; durationMinutes: number };
  customer: { name: string; phone: string };
  vehicle: { licensePlate: string };
  location: string;
  paymentStatus: string;
};

export const washerService = {
  getSchedule: (params?: { date?: string; from?: string; to?: string; status?: string }) =>
    axiosInstance.get<WasherScheduleItem[]>(API.washer.schedule, { params }).then((r) => r.data),
};
