import { vehicleService } from '@/services/vehicle.service';
import { CreateVehicleDto, UpdateVehicleDto } from '@/types/vehicle';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const VEHICLES_KEY = ['vehicles'] as const;

export function useVehicles() {
  return useQuery({
    queryKey: VEHICLES_KEY,
    queryFn: vehicleService.getVehicles,
  });
}

export function useVehicleTypes() {
  return useQuery({
    queryKey: ['vehicle-types'],
    queryFn: vehicleService.getVehicleTypes,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateVehicleDto) => vehicleService.createVehicle(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateVehicleDto }) =>
      vehicleService.updateVehicle(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehicleService.deleteVehicle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}

export function useSetDefaultVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehicleService.setDefaultVehicle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}
