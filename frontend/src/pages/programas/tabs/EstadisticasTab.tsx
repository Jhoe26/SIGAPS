import { Card, CardContent } from "@/components/ui/card";
import { ChartCard } from "@/components/shared/ChartCard";
import { IndicadorSemaforo } from "@/components/charts/IndicadorSemaforo";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { useProgramaDashboard } from "@/hooks/usePrograma";
import type { ProgramaConfig } from "@/lib/programas";

interface TabProps {
  config: ProgramaConfig;
}

export function EstadisticasTab({ config }: TabProps) {
  const { data, isLoading } = useProgramaDashboard(config.clave);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="animate-pulse">
          <CardContent className="h-64 p-4" />
        </Card>
        <Card className="animate-pulse">
          <CardContent className="h-64 p-4" />
        </Card>
      </div>
    );
  }

  const primerMes = data.serieMensual[0]?.mes;
  const ultimoMes = data.serieMensual.at(-1)?.mes;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title={`Tendencia (${primerMes} – ${ultimoMes})`}>
        <SimpleBarChart data={data.serieMensual} color={config.color} />
      </ChartCard>

      <ChartCard title="Indicadores Clave">
        <div className="space-y-5">
          {data.indicadores.map((ind) => (
            <IndicadorSemaforo key={ind.nombre} nombre={ind.nombre} meta={ind.meta} real={ind.real} />
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
