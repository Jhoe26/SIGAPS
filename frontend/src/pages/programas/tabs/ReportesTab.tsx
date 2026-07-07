import { BarChart3, Calendar, FileSpreadsheet, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProgramaConfig } from "@/lib/programas";

interface TabProps {
  config: ProgramaConfig;
}

const REPORTES = [
  { titulo: "Reporte Mensual", icon: Calendar },
  { titulo: "Cobertura por Distrito", icon: MapPin },
  { titulo: "Consolidado Anual", icon: BarChart3 },
];

export function ReportesTab({ config }: TabProps) {
  const avisarProximamente = (formato: string, titulo: string) =>
    toast.info(`Exportar "${titulo}" a ${formato} estará disponible próximamente`);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {REPORTES.map(({ titulo, icon: Icon }) => (
        <Card key={titulo}>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="rounded-lg p-2" style={{ backgroundColor: `${config.color}1A`, color: config.color }}>
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-semibold">{titulo}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => avisarProximamente("PDF", titulo)}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => avisarProximamente("Excel", titulo)}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
