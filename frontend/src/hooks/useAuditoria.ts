import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiResponse, Page } from "@/types/api";
import type { AuditLog } from "@/types/auditoria";

export function useAuditoria(page: number, size = 15) {
  return useQuery({
    queryKey: ["auditoria", page, size],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Page<AuditLog>>>("/auditoria", { params: { page, size } });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}
