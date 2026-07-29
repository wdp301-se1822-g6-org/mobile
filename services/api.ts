import { API } from '@/constants/endpoints';
import { useAuthStore } from '@/stores/useAuthStore';
import { User } from '@/types/auth';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: User;
};

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/otp/send',
  '/auth/otp/verify',
];

// Vẫn gửi kèm Authorization, nhưng 401 thì để fail chứ không refresh.
// /auth/logout mang refreshToken trong body: nếu refresh xen vào giữa, BE đã
// revoke token cũ và cấp token mới, còn body replay vẫn là token cũ -> logout
// hỏng và token mới sống sót ngoài ý muốn. Thà để 401 rơi về caller, phía
// useLogout() vẫn xoá session cục bộ ở onSettled.
const NO_REFRESH_PATHS = ['/auth/logout'];

type RetryableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  /** Access token đã dùng lúc gửi, để phát hiện token đã được xoay trong lúc chờ. */
  _tokenAtSend?: string;
};

export const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config: RetryableConfig) => {
  const { accessToken } = useAuthStore.getState();
  const isPublic = PUBLIC_PATHS.some((p) => config.url?.includes(p));
  if (accessToken && !isPublic) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    config._tokenAtSend = accessToken;
  }
  return config;
});

// Shared in-flight refresh so that many requests failing with 401 at the same
// time trigger exactly one /auth/refresh round-trip (single-flight). Resolves
// with the new access token; rejects when refresh isn't possible.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, authUser } = useAuthStore.getState();
  if (!refreshToken) throw new Error('No refresh token');

  // Bare axios (bypasses this instance's interceptors) so that a 401 on the
  // refresh call itself can never recurse back into the refresh logic.
  const { data } = await axios.post<RefreshResponse>(
    `${axiosInstance.defaults.baseURL}${API.auth.refresh}`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 },
  );

  // Some refresh endpoints return tokens only; fall back to what's cached so a
  // token-only response doesn't wipe authUser or the refresh token.
  const user = data.user ?? authUser;
  // Không còn user nào để dùng (storage bị xoá một phần chẳng hạn): thà ném lỗi
  // cho caller logout, còn hơn set isLoggedIn: true với authUser null — lúc đó
  // app/index.tsx không đọc được role và đá mọi role về (tabs)/home.
  if (!user) throw new Error('Refresh succeeded but no user is available');

  useAuthStore
    .getState()
    .login(data.accessToken, data.refreshToken ?? refreshToken, user);
  return data.accessToken;
}

// BE revoke refresh token cũ mỗi lần xoay, nên một lần refresh hỏng thường là
// dấu chấm hết cho phiên — trừ khi nó hỏng vì lý do tạm thời. Mất mạng/timeout
// (không có response) hoặc 5xx thì giữ session lại: hoặc request chưa tới BE
// (token cũ còn nguyên), hoặc đã tới và token cũ đã chết — lần refresh sau sẽ
// nhận 4xx và logout đúng cách. Mọi 4xx = BE không nhận token nữa -> logout.
function isTransientRefreshError(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  const status = err.response?.status;
  return status === undefined || status >= 500;
}

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const isPublic = PUBLIC_PATHS.some((p) => original?.url?.includes(p));
    const noRefresh = NO_REFRESH_PATHS.some((p) => original?.url?.includes(p));

    // Only a genuine 401 on a protected request we haven't already retried is
    // worth refreshing for. Everything else (other statuses, public auth calls,
    // an already-retried request) falls through to the caller.
    if (status !== 401 || !original || original._retry || isPublic || noRefresh) {
      return Promise.reject(error);
    }

    original._retry = true;

    // Request bay đi với token cũ có thể 401 về *sau* khi một lượt refresh khác
    // đã xong. Store đã có token mới thì phát lại luôn, đừng xoay thêm lần nữa.
    const current = useAuthStore.getState().accessToken;
    if (current && original._tokenAtSend && current !== original._tokenAtSend) {
      original.headers.Authorization = `Bearer ${current}`;
      return axiosInstance(original);
    }

    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;
      // Replay the original request with the fresh token.
      original.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(original);
    } catch (refreshErr) {
      // Refresh token missing/expired/rejected — end the session. Lỗi tạm thời
      // (offline, timeout, 5xx) thì giữ session, caller tự hiện lỗi mạng.
      if (!isTransientRefreshError(refreshErr)) {
        useAuthStore.getState().logout();
      }
      return Promise.reject(refreshErr);
    } finally {
      refreshPromise = null;
    }
  },
);
