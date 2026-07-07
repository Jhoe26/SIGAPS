import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { DistribucionItem } from "@/types/programa";

export function useTamizajeResultados(anio?: number) {
  return useQuery({
    queryKey: ["reportes", "tamizaje-resultados", anio],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DistribucionItem[]>>("/reportes/tamizaje-resultados", {
        params: anio ? { anio } : undefined,
      });
      return data.data;
    },
  });
}
