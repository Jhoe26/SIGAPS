import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ParametroSistema } from "@/types/parametro";

export function useParametro(clave: string, enabled: boolean) {
  return useQuery({
    queryKey: ["parametro", clave],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ParametroSistema>>(`/parametros/${clave}`);
      return data.data;
    },
    enabled,
    retry: false,
  });
}
