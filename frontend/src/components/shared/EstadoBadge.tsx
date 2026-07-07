import { cn } from "@/lib/utils";

export type EstadoVisual = "activo" | "en_tratamiento" | "pendiente" | "inactivo";

const ESTILOS: Record<EstadoVisual, string> = {
  activo: "bg-emerald-50 text-emerald-700",
  en_tratamiento: "bg-blue-50 text-blue-700",
  pendiente: "bg-amber-50 text-amber-700",
  inactivo: "bg-secondary text-muted-foreground",
};

const ETIQUETAS: Record<EstadoVisual, string> = {
  activo: "Activo",
  en_tratamiento: "En tratamiento",
  pendiente: "Pendiente",
  inactivo: "Inactivo",
};

interface EstadoBadgeProps {
  estado: EstadoVisual;
  etiqueta?: string;
}

export function EstadoBadge({ estado, etiqueta }: EstadoBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", ESTILOS[estado])}>
      {etiqueta ?? ETIQUETAS[estado]}
    </span>
  );
}
