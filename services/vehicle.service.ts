import { API } from '@/constants/endpoints';
import { CreateVehicleDto, UpdateVehicleDto, Vehicle, VehicleType } from '@/types/vehicle';
import { axiosInstance } from './api';

// The API returns vehicles with only `vehicleTypeId` (no `vehicleTypeName`),
// so resolve the name from the vehicle-types list for display.
async function typeNameById(): Promise<Map<string, string>> {
  const types = await axiosInstance.get<VehicleType[]>(API.vehicleTypes).then((r) => r.data);
  return new Map(types.map((t) => [t.id, t.name]));
}

const withTypeName = (v: Vehicle, names: Map<string, string>): Vehicle => ({
  ...v,
  vehicleTypeName: v.vehicleTypeName || names.get(v.vehicleTypeId) || '',
});

export const vehicleService = {
  getVehicles: async () => {
    const [vehicles, names] = await Promise.all([
      axiosInstance.get<Vehicle[]>(API.me.vehicles).then((r) => r.data),
      typeNameById(),
    ]);
    return vehicles.map((v) => withTypeName(v, names));
  },

  getVehicle: async (id: string) => {
    const [vehicle, names] = await Promise.all([
      axiosInstance.get<Vehicle>(API.me.vehicle(id)).then((r) => r.data),
      typeNameById(),
    ]);
    return withTypeName(vehicle, names);
  },

  createVehicle: (dto: CreateVehicleDto) =>
    axiosInstance.post<Vehicle>(API.me.vehicles, dto).then((r) => r.data),

  updateVehicle: (id: string, dto: UpdateVehicleDto) =>
    axiosInstance.patch<Vehicle>(API.me.vehicle(id), dto).then((r) => r.data),

  deleteVehicle: (id: string) =>
    axiosInstance.delete(API.me.vehicle(id)),

  setDefaultVehicle: (id: string) =>
    axiosInstance.patch<Vehicle>(API.me.vehicleDefault(id)).then((r) => r.data),

  getVehicleTypes: () =>
    axiosInstance.get<VehicleType[]>(API.vehicleTypes).then((r) => r.data),
};
