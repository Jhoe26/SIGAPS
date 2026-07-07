import { useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

import { cn } from "@/lib/utils";
import { PROGRAMAS } from "@/lib/programas";
import type { ProgramaClave } from "@/types/programa";
import { ProgramaBanner } from "@/pages/programas/ProgramaBanner";
import { DashboardTab } from "@/pages/programas/tabs/DashboardTab";
import { EstadisticasTab } from "@/pages/programas/tabs/EstadisticasTab";
import { PacientesTab } from "@/pages/programas/tabs/PacientesTab";
import { ReportesTab } from "@/pages/programas/tabs/ReportesTab";

type TabId = "dashboard" | "pacientes" | "estadisticas" | "reportes";

const TABS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "pacientes", label: "Pacientes" },
  { id: "estadisticas", label: "Estadísticas" },
  { id: "reportes", label: "Reportes" },
];

function esTabValido(valor: string | null): valor is TabId {
  return TABS.some((t) => t.id === valor);
}

export default function ProgramaPage() {
  const { clave } = useParams<{ clave: string }>();
  const [searchParams] = useSearchParams();
  const config = clave && clave in PROGRAMAS ? PROGRAMAS[clave as ProgramaClave] : undefined;

  const tabInicial = searchParams.get("tab");
  const [tab, setTab] = useState<TabId>(esTabValido(tabInicial) ? tabInicial : "dashboard");
  const [senalNuevoRegistro, setSenalNuevoRegistro] = useState(0);

  if (!config) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-4">
      <ProgramaBanner
        config={config}
        onNuevoRegistro={() => {
          setTab("pacientes");
          setSenalNuevoRegistro((n) => n + 1);
        }}
      />

      <div className="inline-flex rounded-full bg-secondary p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.id ? "bg-foreground text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab config={config} />}
      {tab === "pacientes" && <PacientesTab config={config} senalNuevoRegistro={senalNuevoRegistro} />}
      {tab === "estadisticas" && <EstadisticasTab config={config} />}
      {tab === "reportes" && <ReportesTab config={config} />}
    </div>
  );
}
