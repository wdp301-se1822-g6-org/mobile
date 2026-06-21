import { serviceTypeService } from '@/services/service-type.service';
import { useQuery } from '@tanstack/react-query';

export function useServiceTypes() {
  return useQuery({
    queryKey: ['service-types'],
    queryFn: serviceTypeService.getServiceTypes,
    staleTime: 10 * 60 * 1000,
  });
}
