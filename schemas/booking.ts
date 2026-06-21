import { z } from 'zod';

export const createOrderSchema = z.object({
  serviceTypeId: z.string().min(1, 'Vui lòng chọn dịch vụ'),
  vehicleId: z.string().optional(),
  scheduledAt: z.string().min(1, 'Vui lòng chọn thời gian'),
  paymentMethod: z.enum(['cash', 'online']),
  voucherId: z.string().optional(),
});

export const rescheduleSchema = z.object({
  scheduledAt: z.string().min(1, 'Vui lòng chọn thời gian'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type RescheduleInput = z.infer<typeof rescheduleSchema>;
