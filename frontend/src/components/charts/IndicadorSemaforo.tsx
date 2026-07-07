import { cn } from "@/lib/utils";

interface IndicadorSemaforoProps {
  nombre: string;
  meta: number;
  real: number;
}

function colorSemaforo(real: number, meta: number): { barra: string; texto: string } {
  if (real >= meta) {
    return { barra: "bg-emerald-500", texto: "text-emerald-600" };
  }
  if (real >= meta - 10) {
    return { barra: "bg-amber-500", texto: "text-amber-600" };
  }
  return { barra: "bg-red-500", texto: "text-red-600" };
}

export function IndicadorSemaforo({ nombre, meta, real }: IndicadorSemaforoProps) {
  const { barra, texto } = colorSemaforo(real, meta);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-foreground">{nombre}</span>
        <span className={cn("font-semibold", texto)}>
          {real}% <span className="font-normal text-muted-foreground">/ meta {meta}%</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-all", barra)} style={{ width: `${Math.min(100, real)}%` }} />
      </div>
    </div>
  );
}
