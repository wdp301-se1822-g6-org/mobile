export type VehicleType = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
};

export type Vehicle = {
  id: string;
  customerId: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  licensePlate: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
};

export type CreateVehicleDto = {
  vehicleTypeId: string;
  licensePlate: string;
};

export type UpdateVehicleDto = Partial<CreateVehicleDto>;
