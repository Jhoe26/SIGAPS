import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, Page } from "@/types/api";
import type {
  CredMayor5,
  CredMenor5,
  CreateCredMayor5Input,
  CreateCredMenor5Input,
  UpdateCredMayor5Input,
  UpdateCredMenor5Input,
} from "@/types/cred";

const KEY_MENOR5 = "cred-menor5";
const KEY_MAYOR5 = "cred-mayor5";

export function useCredMenor5List(page: number, size = 50) {
  return useQuery({
    queryKey: [KEY_MENOR5, "lista", page, size],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Page<CredMenor5>>>("/cred-menor5", { params: { page, size } });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCrearCredMenor5() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCredMenor5Input) => {
      const { data } = await api.post<ApiResponse<CredMenor5>>("/cred-menor5", input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Control CRED registrado correctamente");
      queryClient.invalidateQueries({ queryKey: [KEY_MENOR5] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo registrar el control")),
  });
}

export function useActualizarCredMenor5(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateCredMenor5Input) => {
      const { data } = await api.put<ApiResponse<CredMenor5>>(`/cred-menor5/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Control CRED actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: [KEY_MENOR5] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo actualizar el control")),
  });
}

export function useEliminarCredMenor5() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/cred-menor5/${id}`);
    },
    onSuccess: () => {
      toast.success("Control CRED eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: [KEY_MENOR5] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo eliminar el control")),
  });
}

export function useCredMayor5List(page: number, size = 50) {
  return useQuery({
    queryKey: [KEY_MAYOR5, "lista", page, size],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Page<CredMayor5>>>("/cred-mayor5", { params: { page, size } });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCrearCredMayor5() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCredMayor5Input) => {
      const { data } = await api.post<ApiResponse<CredMayor5>>("/cred-mayor5", input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Control CRED registrado correctamente");
      queryClient.invalidateQueries({ queryKey: [KEY_MAYOR5] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo registrar el control")),
  });
}

export function useActualizarCredMayor5(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateCredMayor5Input) => {
      const { data } = await api.put<ApiResponse<CredMayor5>>(`/cred-mayor5/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Control CRED actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: [KEY_MAYOR5] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo actualizar el control")),
  });
}

export function useEliminarCredMayor5() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/cred-mayor5/${id}`);
    },
    onSuccess: () => {
      toast.success("Control CRED eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: [KEY_MAYOR5] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo eliminar el control")),
  });
}
