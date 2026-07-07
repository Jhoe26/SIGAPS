import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/stores/authStore";
import type { ApiResponse } from "@/types/api";
import type { LoginResponse } from "@/types/auth";

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refrescarToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    return null;
  }
  try {
    const { data } = await axios.post<ApiResponse<LoginResponse>>(`${baseURL}/auth/refresh`, {
      refreshToken,
    });
    const { accessToken, refreshToken: nuevoRefreshToken, user } = data.data;
    useAuthStore.getState().setSession(accessToken, nuevoRefreshToken, user);
    return accessToken;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      refreshing ??= refrescarToken();
      const nuevoToken = await refreshing;
      refreshing = null;

      if (nuevoToken) {
        originalRequest.headers.set("Authorization", `Bearer ${nuevoToken}`);
        return api(originalRequest);
      }
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
