import { feedbackService } from '@/services/feedback.service';
import { CreateFeedbackDto } from '@/types/feedback';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMyFeedback() {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: feedbackService.list,
  });
}

export function useOrderFeedback(orderId: string) {
  return useQuery({
    queryKey: ['feedback', orderId],
    queryFn: () => feedbackService.getForOrder(orderId),
    enabled: !!orderId,
    retry: false,
  });
}

export function useSubmitFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFeedbackDto) => feedbackService.upsert(dto),
    onSuccess: (_, dto) => {
      qc.invalidateQueries({ queryKey: ['feedback'] });
      qc.invalidateQueries({ queryKey: ['feedback', dto.orderId] });
      qc.invalidateQueries({ queryKey: ['orders', dto.orderId] });
    },
  });
}
