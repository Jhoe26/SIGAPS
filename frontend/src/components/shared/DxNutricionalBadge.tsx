import { cn } from "@/lib/utils";
import type { DxNutricionalMayor5, DxNutricionalMenor5 } from "@/types/cred";

const ESTILOS: Record<DxNutricionalMenor5 | DxNutricionalMayor5, string> = {
  NORMAL: "bg-emerald-50 text-emerald-700",
  RECUPERADO: "bg-emerald-50 text-emerald-700",
  GANANCIA_INADECUADA: "bg-yellow-50 text-yellow-700",
  SOBREPESO: "bg-orange-50 text-orange-700",
  OBESO: "bg-red-50 text-red-700",
  DESNUTRICION_AGUDA: "bg-red-50 text-red-700",
  DESNUTRICION_CRONICA: "bg-red-50 text-red-700",
};

interface DxNutricionalBadgeProps {
  dxNutricional: DxNutricionalMenor5 | DxNutricionalMayor5;
}

export function DxNutricionalBadge({ dxNutricional }: DxNutricionalBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        ESTILOS[dxNutricional]
      )}
    >
      {dxNutricional.replaceAll("_", " ")}
    </span>
  );
}
