import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

import { ChartCard } from "@/components/shared/ChartCard";
import { ColoredBarChart } from "@/components/charts/ColoredBarChart";
import { MultiSeriesBarChart, type SerieDefinicion } from "@/components/charts/MultiSeriesBarChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardResumen } from "@/hooks/useDashboard";
import { useTamizajeResultados } from "@/hooks/useReporte";
import { SECCIONES_REPORTES } from "@/lib/reportes";

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

function generarReporte() {
  toast.info("Generación de reportes próximamente");
}

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {SECCIONES_REPORTES.map((seccion) => (
          <Card key={seccion.titulo}>
            <CardHeader>
              <CardTitle className="text-base">{seccion.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {seccion.items.map((item) => (
                <div key={item.nombre} className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-secondary/50">
                  <span className="text-sm text-foreground">{item.nombre}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={generarReporte}>
                      <FileText className="mr-1.5 h-3.5 w-3.5" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={generarReporte}>
                      <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                      XLS
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
