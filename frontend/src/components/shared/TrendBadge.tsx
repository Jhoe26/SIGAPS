import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface TrendBadgeProps {
  valor: number;
  className?: string;
}

export function TrendBadge({ valor, className }: TrendBadgeProps) {
  const positivo = valor > 0;
  const neutro = valor === 0;
  const Icon = neutro ? Minus : positivo ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
        neutro && "bg-secondary text-muted-foreground",
        positivo && "bg-emerald-50 text-emerald-600",
        !positivo && !neutro && "bg-red-50 text-red-600",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {positivo ? "+" : ""}
      {valor}%
    </span>
  );
}
