import { API } from '@/constants/endpoints';
import { AuthResponse, LoginDto, OtpSendDto, OtpSendResponse, OtpVerifyDto, OtpVerifyResponse, RegisterDto, User } from '@/types/auth';
import { AUTH_TIMEOUT_MS, axiosInstance } from './api';

// Các call auth dùng timeout riêng, rộng hơn 10s chung của instance: chúng là
// request đầu tiên chạm DB của một app chưa đăng nhập nên phải gánh cold start
// của lambda. Xem AUTH_TIMEOUT_MS trong ./api.
const authConfig = { timeout: AUTH_TIMEOUT_MS };

export const authService = {
  login: (dto: LoginDto) =>
    axiosInstance.post<AuthResponse>(API.auth.login, dto, authConfig).then((r) => r.data),

  register: (dto: RegisterDto) =>
    axiosInstance.post<User>(API.auth.register, dto, authConfig).then((r) => r.data),

  // accessToken truyền tường minh vì useLogout xoá store ngay lúc bấm, còn
  // request interceptor chạy trong microtask sau đó — chờ store thì header
  // Authorization sẽ rỗng. Interceptor chỉ ghi đè khi store còn token, nên
  // header đặt sẵn ở đây sống sót.
  logout: (refreshToken: string, accessToken?: string) =>
    axiosInstance.post(
      API.auth.logout,
      { refreshToken },
      accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined,
    ),

  // Không có refresh() ở đây: refresh chỉ được phép chạy qua single-flight
  // trong services/api.ts. Gọi thẳng từ đây sẽ lấy token mới mà không ghi vào
  // store, trong khi BE đã revoke token cũ -> phiên chết ở request kế tiếp.

  getMe: () =>
    axiosInstance.get<User>(API.auth.me).then((r) => r.data),

  sendOtp: (dto: OtpSendDto) =>
    axiosInstance.post<OtpSendResponse>(API.auth.otpSend, dto, authConfig).then((r) => r.data),

  verifyOtp: (dto: OtpVerifyDto) =>
    axiosInstance.post<OtpVerifyResponse>(API.auth.otpVerify, dto, authConfig).then((r) => r.data),
};
