import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/components/ProtectedRoute";
import RequireAdmin from "@/components/RequireAdmin";
import { Layout } from "@/components/layout/Layout";
import LoginPage from "@/pages/auth/LoginPage";
import ConfiguracionPage from "@/pages/configuracion/ConfiguracionPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import PacientesListPage from "@/pages/pacientes/PacientesListPage";
import ProfesionalesPage from "@/pages/profesionales/ProfesionalesPage";
import ProgramaPage from "@/pages/programas/ProgramaPage";
import ReportesPage from "@/pages/reportes/ReportesPage";
import UsuariosPage from "@/pages/usuarios/UsuariosPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pacientes" element={<PacientesListPage />} />
          <Route path="programas/:clave" element={<ProgramaPage />} />
          <Route path="profesionales" element={<ProfesionalesPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
