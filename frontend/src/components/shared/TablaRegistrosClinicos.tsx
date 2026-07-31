import { Eye, Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

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
  /** Reemplaza el badge de Estado por defecto (ej. diagnóstico clínico con su propio color). */
  estadoBadge?: ReactNode;
  /** Contenido de la columna extra opcional (ver `columnaExtra`). */
  extra?: ReactNode;
  puedeEditar: boolean;
}

interface TablaRegistrosClinicosProps {
  filas: FilaClinica[];
  isLoading: boolean;
  onEditar: (id: number) => void;
  onEliminar: (id: number) => void;
  onVer?: (id: number) => void;
  /** Título de una columna adicional entre "Estado" y "Acciones"; se omite si no se pasa. */
  columnaExtra?: string;
  emptyMessage?: string;
}

export function TablaRegistrosClinicos({
  filas,
  isLoading,
  onEditar,
  onEliminar,
  onVer,
  columnaExtra,
  emptyMessage,
}: TablaRegistrosClinicosProps) {
  if (!isLoading && filas.length === 0) {
    return <EmptyState mensaje={emptyMessage ?? "Sin registros aún"} />;
  }

  const totalColumnas = columnaExtra ? 7 : 6;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Edad</TableHead>
          <TableHead>Profesional</TableHead>
          <TableHead>Último control</TableHead>
          <TableHead>Estado</TableHead>
          {columnaExtra && <TableHead>{columnaExtra}</TableHead>}
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={totalColumnas} className="text-center text-muted-foreground">
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
                {fila.estadoBadge ?? <EstadoBadge estado={fila.estado} etiqueta={fila.estadoEtiqueta} />}
              </TableCell>
              {columnaExtra && <TableCell>{fila.extra ?? "—"}</TableCell>}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!onVer}
                    onClick={() => onVer?.(fila.id)}
                    aria-label="Ver"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!fila.puedeEditar}
                    onClick={() => onEditar(fila.id)}
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!fila.puedeEditar}
                    onClick={() => onEliminar(fila.id)}
                    className="hover:text-destructive"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
