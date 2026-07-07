import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/shared/EmptyState";

interface PuntoSerie {
  mes: string;
  valor: number;
}

interface SimpleAreaChartProps {
  data: PuntoSerie[];
  color: string;
  emptyMessage?: string;
}

export function SimpleAreaChart({ data, color, emptyMessage }: SimpleAreaChartProps) {
  const sinDatos = data.length === 0 || data.every((d) => d.valor === 0);

  if (sinDatos) {
    return <EmptyState mensaje={emptyMessage ?? "Aún no hay registros para graficar"} />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={`fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }} />
        <Area type="monotone" dataKey="valor" stroke={color} strokeWidth={2} fill={`url(#fill-${color.replace("#", "")})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
