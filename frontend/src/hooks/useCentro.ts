import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse } from "@/types/api";
import type { CentroSalud, CreateCentroSaludInput, UpdateCentroSaludInput } from "@/types/centro";

const QUERY_KEY = "centros-salud";

export function useCentros() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CentroSalud[]>>("/centros-salud");
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useCrearCentro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCentroSaludInput) => {
      const { data } = await api.post<ApiResponse<CentroSalud>>("/centros-salud", input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Centro de salud creado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo crear el centro de salud")),
  });
}

export function useActualizarCentro(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateCentroSaludInput) => {
      const { data } = await api.put<ApiResponse<CentroSalud>>(`/centros-salud/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Centro de salud actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "No se pudo actualizar el centro de salud")),
  });
}
