import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstadoBadge, type EstadoVisual } from "@/components/shared/EstadoBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { edadTexto, iniciales } from "@/lib/edad";

export interface FilaClinica {
  id: number;
  pacienteNombre: string;
  pacienteDni: string;
  pacienteFechaNacimiento: string;
  profesionalNombre: string | null;
  fecha: string | null;
  estado: EstadoVisual;
  estadoEtiqueta?: string;
  puedeEditar: boolean;
}

interface TablaRegistrosClinicosProps {
  filas: FilaClinica[];
  isLoading: boolean;
  onEditar: (id: number) => void;
  onEliminar: (id: number) => void;
  emptyMessage?: string;
}

export function TablaRegistrosClinicos({ filas, isLoading, onEditar, onEliminar, emptyMessage }: TablaRegistrosClinicosProps) {
  if (!isLoading && filas.length === 0) {
    return <EmptyState mensaje={emptyMessage ?? "Sin registros aún"} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Edad</TableHead>
          <TableHead>Profesional</TableHead>
          <TableHead>Último control</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Cargando...
            </TableCell>
          </TableRow>
        )}
        {!isLoading &&
          filas.map((fila) => (
            <TableRow key={fila.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-active/10 text-xs font-semibold text-active">
                    {iniciales(fila.pacienteNombre)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{fila.pacienteNombre}</p>
                    <p className="text-xs text-muted-foreground">DNI {fila.pacienteDni}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{edadTexto(fila.pacienteFechaNacimiento)}</TableCell>
              <TableCell>{fila.profesionalNombre ?? "—"}</TableCell>
              <TableCell>{fila.fecha ?? "—"}</TableCell>
              <TableCell>
                <EstadoBadge estado={fila.estado} etiqueta={fila.estadoEtiqueta} />
              </TableCell>
              <TableCell className="text-right">
                {fila.puedeEditar ? (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => onEditar(fila.id)} aria-label="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onEliminar(fila.id)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin acceso</span>
                )}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
