import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/shared/EmptyState";
import { formatEjeY } from "@/lib/chart-format";

interface PuntoSerie {
  mes: string;
  valor: number;
}

interface SimpleBarChartProps {
  data: PuntoSerie[];
  color: string;
  emptyMessage?: string;
}

export function SimpleBarChart({ data, color, emptyMessage }: SimpleBarChartProps) {
  const sinDatos = data.length === 0 || data.every((d) => d.valor === 0);

  if (sinDatos) {
    return <EmptyState mensaje={emptyMessage ?? "Aún no hay registros para graficar"} />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
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
        <Bar dataKey="valor" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
