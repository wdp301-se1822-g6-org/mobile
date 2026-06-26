export type ServiceVehiclePricing = {
  vehicleTypeId: string;
  vehicleTypeName: string;
  price: number;
  estimatedMinutes: number;
  isActive: boolean;
};

export type ServiceType = {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  basePrice: number;
  pointsMultiplier?: number;
  checklistTemplate?: string[];
  isVoucherEligible?: boolean;
  vehiclePricing: ServiceVehiclePricing[];
  isActive: boolean;
};
