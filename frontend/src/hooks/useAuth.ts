import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import type { ApiResponse } from "@/types/api";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credenciales: LoginRequest) => {
      const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", credenciales);
      return data.data;
    },
    onSuccess: (data) => {
      setSession(data.accessToken, data.refreshToken, data.user);
      toast.success(`Bienvenido, ${data.user.nombreCompleto}`);
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Correo/DNI o contraseña incorrectos");
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  return () => {
    clearSession();
    navigate("/login");
  };
}
