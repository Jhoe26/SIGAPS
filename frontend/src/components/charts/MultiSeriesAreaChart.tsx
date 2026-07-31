import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/shared/EmptyState";
import { formatEjeY } from "@/lib/chart-format";
import type { SerieProgramaPunto } from "@/types/dashboard";

interface Serie {
  key: keyof Omit<SerieProgramaPunto, "mes">;
  label: string;
  color: string;
}

const SERIES: Serie[] = [
  { key: "cred", label: "CRED", color: "#2563EB" },
  { key: "vacunacion", label: "Vacunación", color: "#16A34A" },
  { key: "anemia", label: "Anemia", color: "#EA580C" },
  { key: "gestacional", label: "Gestacional", color: "#BE123C" },
];

interface MultiSeriesAreaChartProps {
  data: SerieProgramaPunto[];
}

export function MultiSeriesAreaChart({ data }: MultiSeriesAreaChartProps) {
  const sinDatos = data.length === 0 || data.every((d) => d.cred + d.vacunacion + d.anemia + d.gestacional === 0);

  if (sinDatos) {
    return <EmptyState mensaje="Aún no hay atenciones registradas en ningún programa" />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {SERIES.map((s) => (
            <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
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
        {SERIES.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#fill-${s.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
