import { AxiosError } from "axios";

import type { ApiResponse } from "@/types/api";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    if (data?.message) {
      return data.message;
    }
  }
  return fallback;
}
