import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/authStore";

export default function RequireAdmin() {
  const rol = useAuthStore((s) => s.user?.rol);

  if (rol !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
