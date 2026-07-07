import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Pagination } from "@/components/shared/Pagination";
import { TablaRegistrosClinicos, type FilaClinica } from "@/components/shared/TablaRegistrosClinicos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEliminarTamizaje, useTamizajeList } from "@/hooks/useTamizaje";
import { TamizajeFormDialog } from "@/pages/tamizaje/TamizajeFormDialog";
import { useAuthStore } from "@/stores/authStore";
import type { TamizajeHb } from "@/types/tamizaje";

interface SectionProps {
  senalNuevoRegistro: number;
}

export function TamizajePacientesSection({ senalNuevoRegistro }: SectionProps) {
  const usuarioActualId = useAuthStore((s) => s.user?.id);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registroEnEdicion, setRegistroEnEdicion] = useState<TamizajeHb | null>(null);
  const { data, isLoading } = useTamizajeList(page);
  const eliminar = useEliminarTamizaje();

  useEffect(() => {
    if (senalNuevoRegistro > 0) {
      setRegistroEnEdicion(null);
      setDialogOpen(true);
    }
  }, [senalNuevoRegistro]);

  const filas: FilaClinica[] = (data?.content ?? []).map((r) => ({
    id: r.id,
    pacienteNombre: r.paciente.nombreCompleto,
    pacienteDni: r.paciente.dni,
    pacienteFechaNacimiento: r.paciente.fechaNacimiento,
    profesionalNombre: r.profesional?.nombreCompleto ?? null,
    fecha: r.fecha,
    estado: r.esHistorico ? "inactivo" : r.tipoDosaje === "DOSAJE" ? "activo" : "pendiente",
    estadoEtiqueta: r.esHistorico ? "Histórico" : r.tipoDosaje === "DOSAJE" ? "Con dosaje" : "Sin dosaje",
    puedeEditar: !r.esHistorico && r.registradoPor.id === usuarioActualId,
  }));

  const confirmarEliminar = (id: number) => {
    if (window.confirm("¿Eliminar este tamizaje? Esta acción no se puede deshacer.")) {
      eliminar.mutate(id);
    }
  };

  const abrirEdicion = (id: number) => {
    setRegistroEnEdicion(data?.content.find((r) => r.id === id) ?? null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setRegistroEnEdicion(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Registrar
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <TablaRegistrosClinicos
            filas={filas}
            isLoading={isLoading}
            onEditar={abrirEdicion}
            onEliminar={confirmarEliminar}
            emptyMessage="Sin tamizajes registrados"
          />
        </CardContent>
      </Card>

      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}

      <TamizajeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} registro={registroEnEdicion} />
    </div>
  );
}
