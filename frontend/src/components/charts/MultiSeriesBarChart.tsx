import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/shared/EmptyState";
import { formatEjeY } from "@/lib/chart-format";
import type { SerieProgramaPunto } from "@/types/dashboard";

export interface SerieDefinicion {
  key: keyof Omit<SerieProgramaPunto, "mes">;
  label: string;
  color: string;
}

interface MultiSeriesBarChartProps {
  data: SerieProgramaPunto[];
  series: SerieDefinicion[];
}

export function MultiSeriesBarChart({ data, series }: MultiSeriesBarChartProps) {
  const sinDatos = data.length === 0 || data.every((d) => series.every((s) => d[s.key] === 0));

  if (sinDatos) {
    return <EmptyState mensaje="Aún no hay atenciones registradas en ningún programa" />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#64748B" }}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={formatEjeY}
        />
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
