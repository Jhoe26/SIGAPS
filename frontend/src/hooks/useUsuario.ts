import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, Page } from "@/types/api";
import type { CreateUsuarioInput, UpdateUsuarioInput, Usuario, UsuarioStats } from "@/types/usuario";

const QUERY_KEY = "usuarios";

export function useUsuariosList(page: number, size = 10) {
  return useQuery({
    queryKey: [QUERY_KEY, "lista", page, size],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Page<Usuario>>>("/usuarios", { params: { page, size } });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useUsuarioStats() {
  return useQuery({
    queryKey: [QUERY_KEY, "stats"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UsuarioStats>>("/usuarios/stats");
      return data.data;
    },
  });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateUsuarioInput) => {
      const { data } = await api.post<ApiResponse<Usuario>>("/usuarios", input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Usuario creado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo crear el usuario")),
  });
}

export function useActualizarUsuario(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateUsuarioInput) => {
      const { data } = await api.put<ApiResponse<Usuario>>(`/usuarios/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Usuario actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo actualizar el usuario")),
  });
}

export function useActivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<ApiResponse<Usuario>>(`/usuarios/${id}/activar`);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Usuario activado");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo activar el usuario")),
  });
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<ApiResponse<Usuario>>(`/usuarios/${id}/desactivar`);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Usuario desactivado");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo desactivar el usuario")),
  });
}
