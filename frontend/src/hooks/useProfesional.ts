import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, Page } from "@/types/api";
import type { CreateProfesionalInput, Profesional, UpdateProfesionalInput } from "@/types/profesional";

const QUERY_KEY = "profesionales";

export function useProfesionalesList(q: string, page: number, size = 12) {
  return useQuery({
    queryKey: [QUERY_KEY, "lista", q, page, size],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Page<Profesional>>>("/profesionales", {
        params: { q: q || undefined, page, size },
      });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCrearProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProfesionalInput) => {
      const { data } = await api.post<ApiResponse<Profesional>>("/profesionales", input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Profesional registrado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo registrar el profesional")),
  });
}

export function useActualizarProfesional(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateProfesionalInput) => {
      const { data } = await api.put<ApiResponse<Profesional>>(`/profesionales/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Profesional actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo actualizar el profesional")),
  });
}
