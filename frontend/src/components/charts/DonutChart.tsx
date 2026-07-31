import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { EmptyState } from "@/components/shared/EmptyState";
import type { DistribucionItem } from "@/types/programa";

const PALETA_POR_DEFECTO = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#64748B"];

interface DonutChartProps {
  data: DistribucionItem[];
  colores?: Record<string, string>;
  emptyMessage?: string;
}

export function DonutChart({ data, colores, emptyMessage }: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.valor, 0);

  if (data.length === 0 || total === 0) {
    return <EmptyState mensaje={emptyMessage ?? "Sin datos para mostrar"} />;
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={200} className="max-w-[200px]">
        <PieChart>
          <Pie data={data} dataKey="valor" nameKey="categoria" innerRadius={60} outerRadius={90} paddingAngle={2}>
            {data.map((item, i) => (
              <Cell key={item.categoria} fill={colores?.[item.categoria] ?? PALETA_POR_DEFECTO[i % PALETA_POR_DEFECTO.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="w-full space-y-1.5 text-sm">
        {data.map((item, i) => (
          <li key={item.categoria} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 truncate text-muted-foreground">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colores?.[item.categoria] ?? PALETA_POR_DEFECTO[i % PALETA_POR_DEFECTO.length] }}
              />
              <span className="truncate">{item.categoria}</span>
            </span>
            <span className="shrink-0 font-medium text-foreground">{item.valor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
