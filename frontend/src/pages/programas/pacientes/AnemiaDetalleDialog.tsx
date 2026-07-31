import { DxAnemiaBadge } from "@/components/shared/DxAnemiaBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Anemia } from "@/types/anemia";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro: Anemia | null;
}

interface FilaControl {
  etapa: string;
  fecha: string | null;
  hbObservado: number | null;
  hbCorregido: number | null;
  observaciones: string | null;
}

export function AnemiaDetalleDialog({ open, onOpenChange, registro }: Props) {
  if (!registro) return null;

  const filas: FilaControl[] = [
    {
      etapa: "Diagnóstico inicial",
      fecha: registro.fechaInicio,
      hbObservado: registro.hbInicialObs,
      hbCorregido: registro.hbInicialCorr,
      observaciones: null,
    },
    {
      etapa: "1er control (enfermería)",
      fecha: registro.control1Enfermeria.fecha,
      hbObservado: registro.control1Enfermeria.hbObservado,
      hbCorregido: registro.control1Enfermeria.hbCorregido,
      observaciones: null,
    },
    {
      etapa: "1er control (médico)",
      fecha: registro.control1Medico.fecha,
      hbObservado: null,
      hbCorregido: null,
      observaciones: registro.control1Medico.observaciones,
    },
    {
      etapa: "2do control (enfermería)",
      fecha: registro.control2Enfermeria.fecha,
      hbObservado: registro.control2Enfermeria.hbObservado,
      hbCorregido: registro.control2Enfermeria.hbCorregido,
      observaciones: null,
    },
    {
      etapa: "2do control (médico)",
      fecha: registro.control2Medico.fecha,
      hbObservado: null,
      hbCorregido: null,
      observaciones: registro.control2Medico.observaciones,
    },
    {
      etapa: "3er control (enfermería)",
      fecha: registro.control3Enfermeria.fecha,
      hbObservado: registro.control3Enfermeria.hbObservado,
      hbCorregido: registro.control3Enfermeria.hbCorregido,
      observaciones: null,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{registro.paciente.nombreCompleto}</DialogTitle>
          <p className="text-sm text-muted-foreground">DNI {registro.paciente.dni}</p>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Diagnóstico:</span>
          <DxAnemiaBadge dxInicial={registro.dxInicial} estado={registro.estado} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Control</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hb observada</TableHead>
              <TableHead>Hb corregida</TableHead>
              <TableHead>Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((fila) => (
              <TableRow key={fila.etapa}>
                <TableCell className="font-medium text-foreground">{fila.etapa}</TableCell>
                <TableCell>{fila.fecha ?? "—"}</TableCell>
                <TableCell>{fila.hbObservado ?? "—"}</TableCell>
                <TableCell>{fila.hbCorregido ?? "—"}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={fila.observaciones ?? undefined}>
                  {fila.observaciones ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {registro.observaciones && (
          <div>
            <p className="text-sm font-medium text-foreground">Observaciones generales</p>
            <p className="text-sm text-muted-foreground">{registro.observaciones}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
