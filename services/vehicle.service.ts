import { API } from '@/constants/endpoints';
import { CreateVehicleDto, UpdateVehicleDto, Vehicle, VehicleType } from '@/types/vehicle';
import { axiosInstance } from './api';

export const vehicleService = {
  getVehicles: () =>
    axiosInstance.get<Vehicle[]>(API.me.vehicles).then((r) => r.data),

  getVehicle: (id: string) =>
    axiosInstance.get<Vehicle>(API.me.vehicle(id)).then((r) => r.data),

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
