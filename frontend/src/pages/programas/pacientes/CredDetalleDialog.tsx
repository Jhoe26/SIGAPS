import { DxNutricionalBadge } from "@/components/shared/DxNutricionalBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CredMayor5, CredMenor5 } from "@/types/cred";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro: CredMenor5 | CredMayor5 | null;
}

export function CredDetalleDialog({ open, onOpenChange, registro }: Props) {
  if (!registro) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{registro.paciente.nombreCompleto}</DialogTitle>
          <p className="text-sm text-muted-foreground">DNI {registro.paciente.dni}</p>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Fecha</dt>
            <dd className="font-medium text-foreground">{registro.fecha}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Control</dt>
            <dd className="font-medium text-foreground">
              {registro.numControl ? `Control N°${registro.numControl}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Diagnóstico nutricional</dt>
            <dd>
              <DxNutricionalBadge dxNutricional={registro.dxNutricional} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Peso / Talla</dt>
            <dd className="font-medium text-foreground">
              {registro.peso ?? "—"} kg / {registro.talla ?? "—"}
            </dd>
          </div>
        </dl>

        <div>
          <p className="text-sm font-medium text-foreground">Observaciones</p>
          <p className="text-sm text-muted-foreground">{registro.observaciones ?? "Sin observaciones registradas"}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
