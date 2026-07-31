import { cn } from "@/lib/utils";
import type { DxAnemia, EstadoAnemia } from "@/types/anemia";

const ESTILOS: Record<DxAnemia | "RECUPERADO", string> = {
  LEVE: "bg-yellow-50 text-yellow-700",
  MODERADA: "bg-orange-50 text-orange-700",
  SEVERA: "bg-red-50 text-red-700",
  RECUPERADO: "bg-emerald-50 text-emerald-700",
};

const ETIQUETAS: Record<DxAnemia | "RECUPERADO", string> = {
  LEVE: "Leve",
  MODERADA: "Moderada",
  SEVERA: "Severa",
  RECUPERADO: "Recuperado",
};

interface DxAnemiaBadgeProps {
  dxInicial: DxAnemia;
  estado: EstadoAnemia;
}

/** El diagnóstico de severidad manda mientras el caso siga en tratamiento; una vez
 * recuperado, el badge lo refleja en vez de seguir mostrando la severidad inicial. */
export function DxAnemiaBadge({ dxInicial, estado }: DxAnemiaBadgeProps) {
  const clave = estado === "RECUPERADO" ? "RECUPERADO" : dxInicial;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", ESTILOS[clave])}>
      {ETIQUETAS[clave]}
    </span>
  );
}
