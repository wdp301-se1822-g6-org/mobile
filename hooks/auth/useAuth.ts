import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  ForgotPasswordDto,
  LoginDto,
  OtpSendDto,
  OtpVerifyDto,
  RegisterDto,
  ResetPasswordDto,
} from '@/types/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Dài hơn transition của native-stack (~300ms) để màn cũ kịp unmount trước khi
// session bị xoá. KHÔNG dùng InteractionManager.runAfterInteractions ở đây:
// expo-router chạy trên native-stack, animation nằm hoàn toàn bên native và
// không đăng ký interaction handle nào, nên hàng đợi luôn rỗng và callback bắn
// ngay setImmediate kế tiếp — tức là còn sớm hơn cả router.replace của caller.
const LOGOUT_TEARDOWN_DELAY_MS = 400;

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: (dto: LoginDto) => authService.login(dto),
    onSuccess: (data) => login(data.accessToken, data.refreshToken, data.user),
  });
}

export function useRegister() {
  // Registration creates an inactive account. Its response has the AuthResponse
  // shape, but it must not create a local session before /auth/otp/verify.
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

export function useForgotPassword() {
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) =>
      authService.forgotPassword(dto),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (dto: ResetPasswordDto) =>
      authService.resetPassword(dto),
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
    // Teardown phải chạy SAU khi màn cũ rời khỏi màn hình. onSettled của hook
    // luôn chạy trước onSettled của mutate() — nơi caller gọi router.replace —
    // nên xoá store ngay tại đây khiến màn Me re-render với authUser null (tên
    // rỗng, avatar "?") rồi mới thấy điều hướng, và cái màn rỗng đó còn trôi
    // hết animation. Hoãn lại thì màn cũ giữ nguyên dữ liệu lúc trượt ra, và
    // (tabs) cũng đã unmount nên clear() không còn observer nào để đánh thức —
    // hết loạt refetch 401 (token đã null) chen vào giữa transition.
    onSettled: () => {
      setTimeout(() => {
        logout();
        // Cache của phiên cũ (orders, loyalty…) phải chết theo, nếu không user kế
        // tiếp sẽ thấy nháy dữ liệu của người trước trước khi refetch.
        queryClient.clear();
      }, LOGOUT_TEARDOWN_DELAY_MS);
    },
  });
}
