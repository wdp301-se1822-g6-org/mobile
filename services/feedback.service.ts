import { API } from '@/constants/endpoints';
import { CreateFeedbackDto, Feedback, FeedbackEligibility } from '@/types/feedback';
import { axiosInstance } from './api';

export const feedbackService = {
  list: () =>
    axiosInstance.get<Feedback[]>(API.me.feedback).then((r) => r.data),

  getForOrder: (orderId: string) =>
    axiosInstance.get<FeedbackEligibility>(API.me.feedbackByOrder(orderId)).then((r) => r.data),

  upsert: (dto: CreateFeedbackDto) =>
    axiosInstance.post<Feedback>(API.me.feedback, dto).then((r) => r.data),
};
