import { API } from '@/constants/endpoints';
import { ServiceType, ServiceVehiclePricing } from '@/types/service';
import { axiosInstance } from './api';

// The API returns prices as strings and uses `estimatedMinutes`; normalize to the app's shape.
type RawVehiclePricing = Omit<ServiceVehiclePricing, 'price'> & { price: string | number };
type RawServiceType = Omit<ServiceType, 'basePrice' | 'durationMinutes' | 'vehiclePricing'> & {
  basePrice: string | number;
  estimatedMinutes: number;
  vehiclePricing?: RawVehiclePricing[];
};

const normalize = (s: RawServiceType): ServiceType => ({
  ...s,
  basePrice: Number(s.basePrice) || 0,
  durationMinutes: s.estimatedMinutes,
  vehiclePricing: (s.vehiclePricing ?? []).map((v) => ({ ...v, price: Number(v.price) || 0 })),
});

export const serviceTypeService = {
  getServiceTypes: () =>
    axiosInstance.get<RawServiceType[]>(API.serviceTypes).then((r) => r.data.map(normalize)),

  getServiceType: (id: string) =>
    axiosInstance.get<RawServiceType>(API.serviceType(id)).then((r) => normalize(r.data)),
};
