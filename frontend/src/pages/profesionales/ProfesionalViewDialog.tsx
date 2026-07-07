import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useCentros } from "@/hooks/useCentro";
import { iniciales } from "@/lib/edad";
import { tituloPorColegio } from "@/lib/profesional";
import type { Profesional } from "@/types/profesional";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profesional: Profesional | null;
}

export function ProfesionalViewDialog({ open, onOpenChange, profesional }: Props) {
  const { data: centros } = useCentros();
  if (!profesional) return null;

  const centro = centros?.find((c) => c.id === profesional.centroId);
  const titulo = tituloPorColegio(profesional.tipoColegio);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Perfil de profesional</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-active/10 text-lg font-semibold text-active">
              {iniciales(profesional.nombreCompleto)}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {titulo ? `${titulo} ` : ""}
                {profesional.nombreCompleto}
              </p>
              <p className="text-sm text-muted-foreground">{profesional.especialidad ?? "Sin especialidad registrada"}</p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">DNI</dt>
              <dd className="font-medium text-foreground">{profesional.dni}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Estado</dt>
              <dd>
                <Badge variant={profesional.activo ? "default" : "secondary"}>
                  {profesional.activo ? "Activo" : "Inactivo"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Colegiatura</dt>
              <dd className="font-medium text-foreground">
                {profesional.tipoColegio && profesional.colegiatura
                  ? `${profesional.tipoColegio}-${profesional.colegiatura}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Centro de salud</dt>
              <dd className="font-medium text-foreground">{centro?.nombre ?? "—"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Pacientes atendidos</dt>
              <dd className="font-medium text-foreground">{profesional.totalPacientesAtendidos}</dd>
            </div>
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
