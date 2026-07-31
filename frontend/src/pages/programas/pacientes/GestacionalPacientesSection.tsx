import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Pagination } from "@/components/shared/Pagination";
import { TablaRegistrosClinicos, type FilaClinica } from "@/components/shared/TablaRegistrosClinicos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEliminarGestante, useGestanteList } from "@/hooks/useGestante";
import { GestanteDetalleDialog } from "@/pages/programas/pacientes/GestanteDetalleDialog";
import { GestanteFormDialog } from "@/pages/programas/pacientes/GestanteFormDialog";
import { useAuthStore } from "@/stores/authStore";
import type { Gestante } from "@/types/gestante";

interface SectionProps {
  senalNuevoRegistro: number;
}

const CAMPOS_VACUNA: (keyof Gestante)[] = [
  "influenzaFecha",
  "dt1Fecha",
  "dt2Fecha",
  "dt3Fecha",
  "hepb1Fecha",
  "hepb2Fecha",
  "hepb3Fecha",
  "tdpaFecha",
];

function contarVacunasAplicadas(r: Gestante): number {
  return CAMPOS_VACUNA.filter((campo) => Boolean(r[campo])).length;
}

export function GestacionalPacientesSection({ senalNuevoRegistro }: SectionProps) {
  const usuarioActualId = useAuthStore((s) => s.user?.id);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registroEnEdicion, setRegistroEnEdicion] = useState<Gestante | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [registroEnVista, setRegistroEnVista] = useState<Gestante | null>(null);

  const { data, isLoading } = useGestanteList(page);
  const eliminar = useEliminarGestante();

  useEffect(() => {
    if (senalNuevoRegistro > 0) {
      setRegistroEnEdicion(null);
      setDialogOpen(true);
    }
  }, [senalNuevoRegistro]);

  const filas: FilaClinica[] = (data?.content ?? []).map((r) => {
    const aplicadas = contarVacunasAplicadas(r);
    return {
      id: r.id,
      pacienteNombre: r.paciente.nombreCompleto,
      pacienteDni: r.paciente.dni,
      pacienteFechaNacimiento: r.paciente.fechaNacimiento,
      profesionalNombre: r.profesional?.nombreCompleto ?? null,
      fecha: r.createdAt,
      estado: aplicadas >= CAMPOS_VACUNA.length ? "activo" : "pendiente",
      estadoEtiqueta: `${aplicadas}/${CAMPOS_VACUNA.length} vacunas`,
      puedeEditar: !r.esHistorico && r.registradoPor.id === usuarioActualId,
    };
  });

  const confirmarEliminar = (id: number) => {
    if (window.confirm("¿Eliminar este registro de gestante? Esta acción no se puede deshacer.")) {
      eliminar.mutate(id);
    }
  };

  const abrirEdicion = (id: number) => {
    setRegistroEnEdicion(data?.content.find((r) => r.id === id) ?? null);
    setDialogOpen(true);
  };

  const abrirVista = (id: number) => {
    setRegistroEnVista(data?.content.find((r) => r.id === id) ?? null);
    setDetalleOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
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
            onVer={abrirVista}
            emptyMessage="Sin gestantes registradas"
          />
        </CardContent>
      </Card>

      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}

      <GestanteFormDialog open={dialogOpen} onOpenChange={setDialogOpen} registro={registroEnEdicion} />
      <GestanteDetalleDialog open={detalleOpen} onOpenChange={setDetalleOpen} registro={registroEnVista} />
    </div>
  );
}
