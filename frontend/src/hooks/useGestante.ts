import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, Page } from "@/types/api";
import type { CreateGestanteInput, Gestante, UpdateGestanteInput } from "@/types/gestante";

const QUERY_KEY = "gestante";

export function useGestanteList(page: number, size = 50) {
  return useQuery({
    queryKey: [QUERY_KEY, "lista", page, size],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Page<Gestante>>>("/gestante", { params: { page, size } });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCrearGestante() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateGestanteInput) => {
      const { data } = await api.post<ApiResponse<Gestante>>("/gestante", input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Registro de gestante creado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo registrar a la gestante")),
  });
}

export function useActualizarGestante(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateGestanteInput) => {
      const { data } = await api.put<ApiResponse<Gestante>>(`/gestante/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Registro de gestante actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo actualizar el registro")),
  });
}

export function useEliminarGestante() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/gestante/${id}`);
    },
    onSuccess: () => {
      toast.success("Registro de gestante eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo eliminar el registro")),
  });
}
