import { iniciales } from "@/lib/edad";
import { tiempoRelativo } from "@/lib/tiempo";
import type { ActividadReciente } from "@/types/dashboard";

export function ActivityFeedItem({ usuarioNombre, descripcion, timestamp }: ActividadReciente) {
  return (
    <li className="flex items-start gap-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-active/10 text-xs font-semibold text-active">
        {iniciales(usuarioNombre)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">
          <span className="font-medium">{usuarioNombre}</span> {descripcion}
        </p>
        <p className="text-xs text-muted-foreground">{tiempoRelativo(timestamp)}</p>
      </div>
    </li>
  );
}
