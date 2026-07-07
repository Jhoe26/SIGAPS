import { Card, CardContent } from "@/components/ui/card";
import { ChartCard } from "@/components/shared/ChartCard";
import { DistributionBarList } from "@/components/charts/DistributionBarList";
import { DonutChart } from "@/components/charts/DonutChart";
import { SimpleAreaChart } from "@/components/charts/SimpleAreaChart";
import { useProgramaDashboard } from "@/hooks/usePrograma";
import type { ProgramaConfig } from "@/lib/programas";
import type { DistribucionItem, ProgramaDashboard } from "@/types/programa";

interface TabProps {
  config: ProgramaConfig;
}

interface Tarjeta {
  label: string;
  valor: number | string;
}

function buscarCategoria(distribucion: DistribucionItem[], categoria: string): number {
  return distribucion.find((d) => d.categoria === categoria)?.valor ?? 0;
}

function categoriaMasFrecuente(distribucion: DistribucionItem[]): string {
  if (distribucion.length === 0) return "—";
  return distribucion.reduce((max, d) => (d.valor > max.valor ? d : max), distribucion[0]).categoria;
}

function construirTarjetas(clave: string, data: ProgramaDashboard): Tarjeta[] {
  const cobertura = `${data.indicadores[0]?.real ?? 0}%`;
  switch (clave) {
    case "cred": {
      const sano = buscarCategoria(data.distribucion, "Normal") + buscarCategoria(data.distribucion, "Recuperado");
      return [
        { label: "Pacientes Activos", valor: data.totalActivos },
        { label: "Controles Este Mes", valor: data.esteMes },
        { label: "Con Riesgo Nutricional", valor: Math.max(0, data.totalActivos - sano) },
        { label: "Cobertura Programática", valor: cobertura },
      ];
    }
    case "pai":
      return [
        { label: "Dosis Aplicadas", valor: data.totalActivos },
        { label: "Dosis Este Mes", valor: data.esteMes },
        { label: "Vacuna Más Aplicada", valor: categoriaMasFrecuente(data.distribucion) },
        { label: "Cobertura Programática", valor: cobertura },
      ];
    case "tamizaje":
      return [
        { label: "Tamizajes Realizados", valor: data.totalActivos },
        { label: "Este Mes", valor: data.esteMes },
        { label: "Grupo Etario Principal", valor: categoriaMasFrecuente(data.distribucion) },
        { label: "Cobertura Programática", valor: cobertura },
      ];
    case "anemia":
      return [
        { label: "Casos Registrados", valor: data.totalActivos },
        { label: "Nuevos Este Mes", valor: data.esteMes },
        { label: "Casos Severos", valor: buscarCategoria(data.distribucion, "Severa") },
        { label: "Cobertura Programática", valor: cobertura },
      ];
    case "gestacional":
      return [
        { label: "Gestantes Activas", valor: data.totalActivos },
        { label: "Nuevas Este Mes", valor: data.esteMes },
        { label: "Influenza Aplicada", valor: buscarCategoria(data.distribucion, "Influenza aplicada") },
        { label: "Cobertura Programática", valor: cobertura },
      ];
    default:
      return [];
  }
}

export function DashboardTab({ config }: TabProps) {
  const { data, isLoading } = useProgramaDashboard(config.clave);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => i).map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24 p-4" />
          </Card>
        ))}
      </div>
    );
  }

  const tarjetas = construirTarjetas(config.clave, data);
  const usaDonut = config.clave === "anemia" || config.clave === "gestacional";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <Card key={t.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-semibold leading-none text-foreground">{t.valor}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Tendencia mensual">
          <SimpleAreaChart data={data.serieMensual} color={config.color} />
        </ChartCard>
        <ChartCard title={config.clave === "pai" ? "Cobertura por Vacuna" : "Distribución"}>
          {usaDonut ? (
            <DonutChart data={data.distribucion} />
          ) : (
            <DistributionBarList data={data.distribucion} color={config.color} />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
