import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { SistemaInfo } from "@/types/sistema";

export function useSistemaInfo() {
  return useQuery({
    queryKey: ["sistema", "info"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SistemaInfo>>("/sistema/info");
      return data.data;
    },
  });
}
