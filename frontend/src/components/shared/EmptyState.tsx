import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  mensaje: string;
  icon?: LucideIcon;
}

export function EmptyState({ mensaje, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{mensaje}</p>
    </div>
  );
}
