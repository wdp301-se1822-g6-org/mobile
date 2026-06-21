export type Feedback = {
  id: string;
  orderId: string;
  customerId?: string;
  washerId?: string;
  rating: number;
  washerRating?: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateFeedbackDto = {
  orderId: string;
  rating: number;
  washerRating?: number;
  comment?: string;
};

export type FeedbackEligibility = {
  feedback: Feedback | null;
  canRate: boolean;
  reason?: string;
};
