import { EmptyState } from "@/components/shared/EmptyState";
import type { DistribucionItem } from "@/types/programa";

interface DistributionBarListProps {
  data: DistribucionItem[];
  color: string;
  emptyMessage?: string;
}

export function DistributionBarList({ data, color, emptyMessage }: DistributionBarListProps) {
  const max = Math.max(1, ...data.map((d) => d.valor));

  if (data.length === 0 || data.every((d) => d.valor === 0)) {
    return <EmptyState mensaje={emptyMessage ?? "Sin datos para mostrar"} />;
  }

  return (
    <ul className="space-y-3">
      {data.map((item) => (
        <li key={item.categoria}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="truncate text-muted-foreground">{item.categoria}</span>
            <span className="shrink-0 font-medium text-foreground">{item.valor}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(item.valor / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
