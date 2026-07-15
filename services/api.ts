import { API } from '@/constants/endpoints';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthResponse } from '@/types/auth';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/otp/send',
  '/auth/otp/verify',
];

export const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  const isPublic = PUBLIC_PATHS.some((p) => config.url?.includes(p));
  if (accessToken && !isPublic) {
    config.headers.Authorization = `Bearer ${accessToken}`;
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
  const { data } = await axios.post<AuthResponse>(
    `${axiosInstance.defaults.baseURL}${API.auth.refresh}`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 },
  );

  // Some refresh endpoints return tokens only; fall back to the current user so
  // a token-only response doesn't wipe authUser.
  useAuthStore.getState().login(data.accessToken, data.refreshToken, data.user ?? authUser!);
  return data.accessToken;
}

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const isPublic = PUBLIC_PATHS.some((p) => original?.url?.includes(p));

    // Only a genuine 401 on a protected request we haven't already retried is
    // worth refreshing for. Everything else (other statuses, public auth calls,
    // an already-retried request) falls through to the caller.
    if (status !== 401 || !original || original._retry || isPublic) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;
      // Replay the original request with the fresh token.
      original.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(original);
    } catch (refreshErr) {
      // Refresh token missing/expired/rejected — end the session.
      useAuthStore.getState().logout();
      return Promise.reject(refreshErr);
    } finally {
      refreshPromise = null;
    }
  },
);
