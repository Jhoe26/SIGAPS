import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { VacunaCatalogo } from "@/types/catalogo";

export function useVacunas() {
  return useQuery({
    queryKey: ["catalogo", "vacunas"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<VacunaCatalogo[]>>("/catalogos/vacunas");
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}
