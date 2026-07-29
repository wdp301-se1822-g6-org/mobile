import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';
import { LoginDto, OtpSendDto, OtpVerifyDto, RegisterDto } from '@/types/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: (dto: LoginDto) => authService.login(dto),
    onSuccess: (data) => login(data.accessToken, data.refreshToken, data.user),
  });
}

export function useRegister() {
  // /auth/register returns the created user only — no tokens.
  // Caller should follow up with useLogin() to acquire a session.
  return useMutation({
    mutationFn: (dto: RegisterDto) => authService.register(dto),
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (dto: OtpSendDto) => authService.sendOtp(dto),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (dto: OtpVerifyDto) => authService.verifyOtp(dto),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  return useMutation({
    // Không await round-trip: phiên cục bộ phải chết ngay khi user bấm, việc BE
    // thu hồi token chạy nền. Trước đây onSettled chờ /auth/logout nên user đứng
    // hình tới 10s (timeout của axiosInstance) mỗi khi mạng/BE chậm.
    // Token đọc từ store tại thời điểm bắn để tránh closure cũ nếu vừa có refresh.
    mutationFn: async () => {
      const { accessToken, refreshToken } = useAuthStore.getState();
      authService.logout(refreshToken ?? '', accessToken ?? undefined).catch(() => {});
    },
    onSettled: () => {
      logout();
      // Cache của phiên cũ (orders, loyalty…) phải chết theo, nếu không user kế
      // tiếp sẽ thấy nháy dữ liệu của người trước trước khi refetch.
      queryClient.clear();
    },
  });
}
