import {
  Activity,
  Baby,
  ChevronRight,
  FileText,
  HeartPulse,
  Syringe,
  Target,
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
import { cn } from "@/lib/utils";

const ICONOS: Record<string, LucideIcon> = {
  pacientesHoy: Users,
  atencionesHoy: Activity,
  vacunasEsteMes: Syringe,
  controlesCred: HeartPulse,
  gestantesActivas: Baby,
  anemiaEnTratamiento: Activity,
};

const COLORES_ANEMIA: Record<string, string> = {
  Normal: "#16A34A",
  Recuperado: "#16A34A",
  Leve: "#F59E0B",
  Moderada: "#F97316",
  Severa: "#DC2626",
};

const COLOR_TARJETA: Record<string, string> = {
  pacientesHoy: "bg-blue-50 text-blue-600",
  atencionesHoy: "bg-green-50 text-green-600",
  vacunasEsteMes: "bg-purple-50 text-purple-600",
  controlesCred: "bg-pink-50 text-pink-600",
  gestantesActivas: "bg-red-50 text-red-600",
  anemiaEnTratamiento: "bg-yellow-50 text-yellow-600",
};

const ACCIONES_RAPIDAS = [
  { label: "Registrar Paciente", to: "/pacientes/nuevo", icon: UserPlus, color: "bg-blue-50 text-blue-600" },
  { label: "Registrar Vacuna", to: "/programas/pai?tab=pacientes", icon: Syringe, color: "bg-green-50 text-green-600" },
  { label: "Control CRED", to: "/programas/cred?tab=pacientes", icon: Target, color: "bg-purple-50 text-purple-600" },
  { label: "Generar Reporte", to: "/reportes", icon: FileText, color: "bg-amber-50 text-amber-600" },
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
            total={card.total}
            colorClassName={COLOR_TARJETA[card.clave]}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <ChartCard title="Atenciones por Programa">
          <MultiSeriesAreaChart data={data.atencionesPorPrograma} />
        </ChartCard>

        <div className="space-y-4">
          <ChartCard title="Distribución Anemia">
            <DonutChart
              data={data.distribucionAnemia}
              colores={COLORES_ANEMIA}
              emptyMessage="Sin casos de anemia registrados"
            />
          </ChartCard>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {ACCIONES_RAPIDAS.map(({ label, to, icon: Icon, color }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-medium text-foreground transition-colors hover:border-active hover:bg-active/5"
                >
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", color)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 truncate">{label}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
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
      </div>
    </div>
  );
}
