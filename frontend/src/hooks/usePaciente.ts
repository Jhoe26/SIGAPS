import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, Page } from "@/types/api";
import type { CreatePacienteInput, Paciente, UpdatePacienteInput } from "@/types/paciente";

const QUERY_KEY = "pacientes";

export function usePacientesQuery(search: string, page: number) {
  return useQuery({
    queryKey: [QUERY_KEY, search, page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Page<Paciente>>>("/pacientes", {
        params: { search: search || undefined, page, size: 10 },
      });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCrearPaciente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePacienteInput) => {
      const { data } = await api.post<ApiResponse<Paciente>>("/pacientes", input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Paciente registrado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo registrar el paciente"));
    },
  });
}

export function useActualizarPaciente(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdatePacienteInput) => {
      const { data } = await api.put<ApiResponse<Paciente>>(`/pacientes/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Paciente actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo actualizar el paciente"));
    },
  });
}
