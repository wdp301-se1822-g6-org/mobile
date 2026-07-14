export type Feedback = {
  id: string;
  orderId: string;
  customerId?: string;
  washerId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateFeedbackDto = {
  orderId: string;
  rating: number;
  comment?: string;
};

export type FeedbackEligibility = {
  feedback: Feedback | null;
  eligible: boolean;
  alreadyRated: boolean;
};
