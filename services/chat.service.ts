import { API } from '@/constants/endpoints';
import { ChatMessage, ChatResponse } from '@/types/chat';
import { axiosInstance } from './api';

export const chatService = {
  sendMessage: (message: string, sessionId?: string) =>
    axiosInstance.post<ChatResponse>(API.chat.message, { message, sessionId }).then((r) => r.data),

  getSession: (sessionId: string) =>
    axiosInstance.get<ChatMessage[]>(API.chat.session(sessionId)).then((r) => r.data),
};
