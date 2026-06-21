import { washerService } from '@/services/washer.service';
import { useQuery } from '@tanstack/react-query';

export function useWasherSchedule(params?: { date?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ['washer-schedule', params ?? {}],
    queryFn: () => washerService.getSchedule(params),
  });
}
