import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { DashboardResumen } from "@/types/dashboard";

export function useDashboardResumen() {
  return useQuery({
    queryKey: ["dashboard", "resumen"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardResumen>>("/dashboard/resumen");
      return data.data;
    },
  });
}
