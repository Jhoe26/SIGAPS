import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  valor: number;
  subtexto?: string;
  /** Total histórico de la métrica; se muestra sin porcentaje cuando difiere del valor
   * principal (no hay un período anterior real con el que comparar una tendencia). */
  total?: number;
  colorClassName?: string;
}

export function StatCard({ icon: Icon, label, valor, subtexto, total, colorClassName }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClassName ?? "bg-active/10 text-active")}>
            <Icon className="h-5 w-5" />
          </div>
          {total !== undefined && total !== valor && (
            <span className="text-xs font-medium text-muted-foreground">{total.toLocaleString("es-PE")} en total</span>
          )}
        </div>
        <p className="mt-3 text-3xl font-bold leading-none text-foreground">{valor.toLocaleString("es-PE")}</p>
        <p className="mt-1 text-sm font-medium text-foreground/80">{label}</p>
        {subtexto && <p className="mt-0.5 truncate text-xs text-muted-foreground" title={subtexto}>{subtexto}</p>}
      </CardContent>
    </Card>
  );
}
