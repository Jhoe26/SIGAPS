import {
  Activity,
  Baby,
  ClipboardPlus,
  FileBarChart,
  HeartPulse,
  Syringe,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { ActivityFeedItem } from "@/components/shared/ActivityFeedItem";
import { ChartCard } from "@/components/shared/ChartCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart } from "@/components/charts/DonutChart";
import { IndicadorSemaforo } from "@/components/charts/IndicadorSemaforo";
import { MultiSeriesAreaChart } from "@/components/charts/MultiSeriesAreaChart";
import { useDashboardResumen } from "@/hooks/useDashboard";

const ICONOS: Record<string, LucideIcon> = {
  pacientesHoy: Users,
  atencionesHoy: Activity,
  vacunasEsteMes: Syringe,
  controlesCred: HeartPulse,
  gestantesActivas: Baby,
  anemiaEnTratamiento: Activity,
};

const COLORES_ANEMIA: Record<string, string> = {
  Leve: "#F59E0B",
  Moderada: "#F97316",
  Severa: "#EF4444",
};

const ACCIONES_RAPIDAS = [
  { label: "Registrar Paciente", to: "/pacientes", icon: UserPlus },
  { label: "Registrar Vacuna", to: "/programas/pai?tab=pacientes", icon: Syringe },
  { label: "Control CRED", to: "/programas/cred?tab=pacientes", icon: ClipboardPlus },
  { label: "Generar Reporte", to: "/reportes", icon: FileBarChart },
];

export default function DashboardPage() {
  const { data, isLoading } = useDashboardResumen();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => i).map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-28 p-4" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {data.statCards.map((card) => (
          <StatCard
            key={card.clave}
            icon={ICONOS[card.clave] ?? Activity}
            label={card.label}
            valor={card.valor}
            subtexto={card.subtexto}
            tendenciaPct={card.tendenciaPct}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Atenciones por Programa">
          <MultiSeriesAreaChart data={data.atencionesPorPrograma} />
        </ChartCard>
        <ChartCard title="Distribución Anemia">
          <DonutChart
            data={data.distribucionAnemia}
            colores={COLORES_ANEMIA}
            emptyMessage="Sin casos de anemia registrados"
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Cobertura Vacunal" badge="Actualizado hoy">
          {data.coberturaVacunal.length === 0 ? (
            <EmptyState mensaje="Sin dosis registradas aún" />
          ) : (
            <div className="space-y-4">
              {data.coberturaVacunal.map((v) => (
                <IndicadorSemaforo key={v.vacuna} nombre={v.vacuna} meta={v.meta} real={v.real} />
              ))}
            </div>
          )}
        </ChartCard>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              {data.actividadReciente.length === 0 ? (
                <EmptyState mensaje="Sin actividad reciente" />
              ) : (
                <ul className="divide-y divide-border">
                  {data.actividadReciente.map((a) => (
                    <ActivityFeedItem key={`${a.usuarioId}-${a.timestamp}`} {...a} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {ACCIONES_RAPIDAS.map(({ label, to, icon: Icon }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-center text-xs font-medium text-foreground transition-colors hover:border-active hover:bg-active/5"
                >
                  <Icon className="h-5 w-5 text-active" />
                  {label}
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
