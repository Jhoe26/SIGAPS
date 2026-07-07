import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, Page } from "@/types/api";
import type { Anemia, CreateAnemiaInput, UpdateAnemiaInput } from "@/types/anemia";

const QUERY_KEY = "anemia";

export function useAnemiaList(page: number, size = 10) {
  return useQuery({
    queryKey: [QUERY_KEY, "lista", page, size],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Page<Anemia>>>("/anemia", { params: { page, size } });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCrearAnemia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAnemiaInput) => {
      const { data } = await api.post<ApiResponse<Anemia>>("/anemia", input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Caso de anemia registrado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo registrar el caso")),
  });
}

export function useActualizarAnemia(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateAnemiaInput) => {
      const { data } = await api.put<ApiResponse<Anemia>>(`/anemia/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Caso de anemia actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo actualizar el caso")),
  });
}

export function useEliminarAnemia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/anemia/${id}`);
    },
    onSuccess: () => {
      toast.success("Caso de anemia eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo eliminar el caso")),
  });
}
