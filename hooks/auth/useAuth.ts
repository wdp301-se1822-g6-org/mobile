import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';
import { LoginDto, OtpSendDto, OtpVerifyDto, RegisterDto } from '@/types/auth';
import { useMutation } from '@tanstack/react-query';

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
  const { refreshToken, logout } = useAuthStore();
  return useMutation({
    mutationFn: () => authService.logout(refreshToken ?? ''),
    onSettled: logout,
  });
}
