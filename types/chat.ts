export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
};

export type ChatResponse = {
  reply: string;
  sessionId: string;
};
