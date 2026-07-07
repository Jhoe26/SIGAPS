import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, Page } from "@/types/api";
import type { CreatePaiInput, Pai, SubmoduloPai, UpdatePaiInput } from "@/types/pai";

export function usePaiList(submodulo: SubmoduloPai, page: number, size = 10) {
  return useQuery({
    queryKey: [submodulo, "lista", page, size],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Page<Pai>>>(`/${submodulo}`, { params: { page, size } });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCrearPai(submodulo: SubmoduloPai) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePaiInput) => {
      const { data } = await api.post<ApiResponse<Pai>>(`/${submodulo}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Dosis registrada correctamente");
      queryClient.invalidateQueries({ queryKey: [submodulo] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo registrar la dosis")),
  });
}

export function useActualizarPai(submodulo: SubmoduloPai, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdatePaiInput) => {
      const { data } = await api.put<ApiResponse<Pai>>(`/${submodulo}/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Dosis actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: [submodulo] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo actualizar la dosis")),
  });
}

export function useEliminarPai(submodulo: SubmoduloPai) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/${submodulo}/${id}`);
    },
    onSuccess: () => {
      toast.success("Dosis eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: [submodulo] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo eliminar la dosis")),
  });
}
