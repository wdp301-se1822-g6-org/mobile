import { API } from '@/constants/endpoints';
import { AuthResponse, LoginDto, OtpSendDto, OtpSendResponse, OtpVerifyDto, OtpVerifyResponse, RegisterDto, User } from '@/types/auth';
import { axiosInstance } from './api';

export const authService = {
  login: (dto: LoginDto) =>
    axiosInstance.post<AuthResponse>(API.auth.login, dto).then((r) => r.data),

  register: (dto: RegisterDto) =>
    axiosInstance.post<User>(API.auth.register, dto).then((r) => r.data),

  logout: (refreshToken: string) =>
    axiosInstance.post(API.auth.logout, { refreshToken }),

  // Không có refresh() ở đây: refresh chỉ được phép chạy qua single-flight
  // trong services/api.ts. Gọi thẳng từ đây sẽ lấy token mới mà không ghi vào
  // store, trong khi BE đã revoke token cũ -> phiên chết ở request kế tiếp.

  getMe: () =>
    axiosInstance.get<User>(API.auth.me).then((r) => r.data),

  sendOtp: (dto: OtpSendDto) =>
    axiosInstance.post<OtpSendResponse>(API.auth.otpSend, dto).then((r) => r.data),

  verifyOtp: (dto: OtpVerifyDto) =>
    axiosInstance.post<OtpVerifyResponse>(API.auth.otpVerify, dto).then((r) => r.data),
};
