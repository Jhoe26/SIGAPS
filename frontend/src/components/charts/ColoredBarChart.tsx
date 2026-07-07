import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/shared/EmptyState";

interface ItemColoreado {
  categoria: string;
  valor: number;
  color: string;
}

interface ColoredBarChartProps {
  data: ItemColoreado[];
  emptyMessage?: string;
}

export function ColoredBarChart({ data, emptyMessage }: ColoredBarChartProps) {
  const sinDatos = data.length === 0 || data.every((d) => d.valor === 0);

  if (sinDatos) {
    return <EmptyState mensaje={emptyMessage ?? "Aún no hay registros para graficar"} />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="categoria" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }} />
        <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
          {data.map((item) => (
            <Cell key={item.categoria} fill={item.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
