import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProgramaConfig } from "@/lib/programas";

interface ProgramaBannerProps {
  config: ProgramaConfig;
  onNuevoRegistro: () => void;
}

export function ProgramaBanner({ config, onNuevoRegistro }: ProgramaBannerProps) {
  const Icon = config.icon;

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl p-6 text-white sm:flex-row sm:items-center sm:justify-between"
      style={{ background: `linear-gradient(135deg, ${config.gradienteDesde}, ${config.gradienteHasta})` }}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/15 p-3">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{config.titulo}</h1>
          <p className="text-sm text-white/80">{config.subtitulo}</p>
        </div>
      </div>
      <Button
        onClick={onNuevoRegistro}
        className="w-fit bg-white text-foreground hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Registro
      </Button>
    </div>
  );
}
