import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ProgramaClave, ProgramaDashboard } from "@/types/programa";

export function useProgramaDashboard(clave: ProgramaClave) {
  return useQuery({
    queryKey: ["programa", clave, "dashboard"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ProgramaDashboard>>(`/programas/${clave}/dashboard`);
      return data.data;
    },
  });
}
