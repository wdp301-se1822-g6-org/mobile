import { z } from 'zod';

export const vehicleSchema = z.object({
  vehicleTypeId: z.string().min(1, 'Vui lòng chọn loại xe'),
  licensePlate: z
    .string()
    .min(1, 'Vui lòng nhập biển số')
    .regex(/^[0-9]{2}[A-Z]{1,2}[-.]?[0-9]{4,5}$/, 'Biển số không hợp lệ'),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
