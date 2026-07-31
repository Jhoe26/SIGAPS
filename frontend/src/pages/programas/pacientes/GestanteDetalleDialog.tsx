import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Gestante } from "@/types/gestante";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro: Gestante | null;
}

function CeldaFecha({ fecha }: { fecha: string | null }) {
  if (!fecha) {
    return <span className="text-muted-foreground">Pendiente</span>;
  }
  return <span>{fecha}</span>;
}

export function GestanteDetalleDialog({ open, onOpenChange, registro }: Props) {
  if (!registro) return null;

  type CeldaDosis = string | null | undefined; // undefined = dosis no aplica a esta vacuna, null = pendiente
  const filas: { vacuna: string; dosis1: CeldaDosis; dosis2: CeldaDosis; dosis3: CeldaDosis }[] = [
    { vacuna: "Influenza", dosis1: registro.influenzaFecha, dosis2: undefined, dosis3: undefined },
    { vacuna: "DT", dosis1: registro.dt1Fecha, dosis2: registro.dt2Fecha, dosis3: registro.dt3Fecha },
    { vacuna: "Hepatitis B", dosis1: registro.hepb1Fecha, dosis2: registro.hepb2Fecha, dosis3: registro.hepb3Fecha },
    { vacuna: "TDPa", dosis1: registro.tdpaFecha, dosis2: undefined, dosis3: undefined },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{registro.paciente.nombreCompleto}</DialogTitle>
          <p className="text-sm text-muted-foreground">DNI {registro.paciente.dni}</p>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vacuna</TableHead>
              <TableHead>1ra dosis</TableHead>
              <TableHead>2da dosis</TableHead>
              <TableHead>3ra dosis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((fila) => (
              <TableRow key={fila.vacuna}>
                <TableCell className="font-medium text-foreground">{fila.vacuna}</TableCell>
                <TableCell>{fila.dosis1 !== undefined ? <CeldaFecha fecha={fila.dosis1} /> : "—"}</TableCell>
                <TableCell>{fila.dosis2 !== undefined ? <CeldaFecha fecha={fila.dosis2} /> : "—"}</TableCell>
                <TableCell>{fila.dosis3 !== undefined ? <CeldaFecha fecha={fila.dosis3} /> : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {registro.observaciones && (
          <div>
            <p className="text-sm font-medium text-foreground">Observaciones</p>
            <p className="text-sm text-muted-foreground">{registro.observaciones}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
