import { API } from '@/constants/endpoints';
import { ServiceType } from '@/types/service';
import { axiosInstance } from './api';

export const serviceTypeService = {
  getServiceTypes: () =>
    axiosInstance.get<ServiceType[]>(API.serviceTypes).then((r) => r.data),

  getServiceType: (id: string) =>
    axiosInstance.get<ServiceType>(API.serviceType(id)).then((r) => r.data),
};
