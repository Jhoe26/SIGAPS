import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, Page } from "@/types/api";
import type { CreateTamizajeInput, TamizajeHb, UpdateTamizajeInput } from "@/types/tamizaje";

const QUERY_KEY = "tamizaje";

export function useTamizajeList(page: number, size = 10) {
  return useQuery({
    queryKey: [QUERY_KEY, "lista", page, size],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Page<TamizajeHb>>>("/tamizaje", { params: { page, size } });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCrearTamizaje() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTamizajeInput) => {
      const { data } = await api.post<ApiResponse<TamizajeHb>>("/tamizaje", input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Tamizaje registrado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo registrar el tamizaje"));
    },
  });
}

export function useActualizarTamizaje(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateTamizajeInput) => {
      const { data } = await api.put<ApiResponse<TamizajeHb>>(`/tamizaje/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Tamizaje actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo actualizar el tamizaje"));
    },
  });
}

export function useEliminarTamizaje() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tamizaje/${id}`);
    },
    onSuccess: () => {
      toast.success("Tamizaje eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo eliminar el tamizaje"));
    },
  });
}
