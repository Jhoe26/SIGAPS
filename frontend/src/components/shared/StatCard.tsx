import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { TrendBadge } from "@/components/shared/TrendBadge";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  valor: number;
  subtexto?: string;
  tendenciaPct?: number;
  colorClassName?: string;
}

export function StatCard({ icon: Icon, label, valor, subtexto, tendenciaPct, colorClassName }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn("rounded-lg p-2", colorClassName ?? "bg-active/10 text-active")}>
            <Icon className="h-5 w-5" />
          </div>
          {tendenciaPct !== undefined && <TrendBadge valor={tendenciaPct} />}
        </div>
        <p className="mt-3 text-2xl font-semibold leading-none text-foreground">{valor}</p>
        <p className="mt-1 text-sm font-medium text-foreground/80">{label}</p>
        {subtexto && <p className="mt-0.5 truncate text-xs text-muted-foreground" title={subtexto}>{subtexto}</p>}
      </CardContent>
    </Card>
  );
}
