import { API } from '@/constants/endpoints';
import { AuthResponse, LoginDto, OtpSendDto, OtpSendResponse, OtpVerifyDto, OtpVerifyResponse, RegisterDto, User } from '@/types/auth';
import { axiosInstance } from './api';

export const authService = {
  login: (dto: LoginDto) =>
    axiosInstance.post<AuthResponse>(API.auth.login, dto).then((r) => r.data),

  register: (dto: RegisterDto) =>
    axiosInstance.post<AuthResponse>(API.auth.register, dto).then((r) => r.data),

  logout: (refreshToken: string) =>
    axiosInstance.post(API.auth.logout, { refreshToken }),

  refresh: (refreshToken: string) =>
    axiosInstance.post<AuthResponse>(API.auth.refresh, { refreshToken }).then((r) => r.data),

  getMe: () =>
    axiosInstance.get<User>(API.auth.me).then((r) => r.data),

  sendOtp: (dto: OtpSendDto) =>
    axiosInstance.post<OtpSendResponse>(API.auth.otpSend, dto).then((r) => r.data),

  verifyOtp: (dto: OtpVerifyDto) =>
    axiosInstance.post<OtpVerifyResponse>(API.auth.otpVerify, dto).then((r) => r.data),
};
