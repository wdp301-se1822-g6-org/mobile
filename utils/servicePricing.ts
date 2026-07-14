import { ServiceType } from '@/types/service';

export type ResolvedPricing = { price: number; duration: number };

// Price/duration of a service for one vehicle type. Null when the service has no
// active pricing for that type, meaning it is not offered for that vehicle at all.
export function resolveVehiclePricing(
  service: ServiceType,
  vehicleTypeId?: string,
): ResolvedPricing | null {
  if (!vehicleTypeId) return null;
  const vp = service.vehiclePricing?.find(
    (v) => v.vehicleTypeId === vehicleTypeId && v.isActive,
  );
  return vp ? { price: vp.price, duration: vp.estimatedMinutes } : null;
}
