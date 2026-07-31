import { FileText } from "lucide-react";

import { ChartCard } from "@/components/shared/ChartCard";
import { ColoredBarChart } from "@/components/charts/ColoredBarChart";
import { MultiSeriesBarChart, type SerieDefinicion } from "@/components/charts/MultiSeriesBarChart";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardResumen } from "@/hooks/useDashboard";
import { useTamizajeResultados } from "@/hooks/useReporte";

const SERIES_PROGRAMA: SerieDefinicion[] = [
  { key: "cred", label: "CRED", color: "#7C3AED" },
  { key: "vacunacion", label: "Vacunación", color: "#047857" },
  { key: "anemia", label: "Anemia", color: "#EA580C" },
  { key: "gestacional", label: "Gestacional", color: "#BE123C" },
];

const COLOR_RESULTADO: Record<string, string> = {
  Positivos: "#DC2626",
  Negativos: "#16A34A",
  Pendientes: "#D97706",
};

export default function ReportesPage() {
  const anioActual = new Date().getFullYear();
  const { data: resumen, isLoading: cargandoResumen } = useDashboardResumen();
  const { data: tamizaje, isLoading: cargandoTamizaje } = useTamizajeResultados(anioActual);

  const primerMes = resumen?.atencionesPorPrograma[0]?.mes;
  const ultimoMes = resumen?.atencionesPorPrograma.at(-1)?.mes;
  const tituloResumen = primerMes && ultimoMes ? `Resumen Ejecutivo — ${primerMes} a ${ultimoMes}` : "Resumen Ejecutivo";

  const datosTamizaje = (tamizaje ?? []).map((item) => ({
    categoria: item.categoria,
    valor: item.valor,
    color: COLOR_RESULTADO[item.categoria] ?? "#64748B",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Reportes</h1>
        <p className="text-sm text-muted-foreground">Consolidados y descargables por programa de salud</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title={tituloResumen}>
          {cargandoResumen ? (
            <div className="h-64 animate-pulse" />
          ) : (
            <MultiSeriesBarChart data={resumen?.atencionesPorPrograma ?? []} series={SERIES_PROGRAMA} />
          )}
        </ChartCard>

        <ChartCard title={`Tamizaje ${anioActual} — Resultados`}>
          {cargandoTamizaje ? (
            <div className="h-64 animate-pulse" />
          ) : (
            <ColoredBarChart data={datosTamizaje} />
          )}
        </ChartCard>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Módulo de reportes en desarrollo — disponible próximamente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
