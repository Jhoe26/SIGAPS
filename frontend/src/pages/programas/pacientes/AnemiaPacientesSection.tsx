import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { DxAnemiaBadge } from "@/components/shared/DxAnemiaBadge";
import { Pagination } from "@/components/shared/Pagination";
import { TablaRegistrosClinicos, type FilaClinica } from "@/components/shared/TablaRegistrosClinicos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnemiaList, useEliminarAnemia } from "@/hooks/useAnemia";
import { AnemiaDetalleDialog } from "@/pages/programas/pacientes/AnemiaDetalleDialog";
import { AnemiaFormDialog } from "@/pages/programas/pacientes/AnemiaFormDialog";
import { useAuthStore } from "@/stores/authStore";
import type { Anemia } from "@/types/anemia";

interface SectionProps {
  senalNuevoRegistro: number;
}

function truncar(texto: string, longitud: number): string {
  return texto.length > longitud ? `${texto.slice(0, longitud)}...` : texto;
}

export function AnemiaPacientesSection({ senalNuevoRegistro }: SectionProps) {
  const usuarioActualId = useAuthStore((s) => s.user?.id);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registroEnEdicion, setRegistroEnEdicion] = useState<Anemia | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [registroEnVista, setRegistroEnVista] = useState<Anemia | null>(null);

  const { data, isLoading } = useAnemiaList(page);
  const eliminar = useEliminarAnemia();

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
    fecha: r.fechaInicio,
    estado: "pendiente",
    estadoBadge: <DxAnemiaBadge dxInicial={r.dxInicial} estado={r.estado} />,
    extra: r.observaciones ? (
      <span title={r.observaciones}>{truncar(r.observaciones, 30)}</span>
    ) : (
      "—"
    ),
    puedeEditar: !r.esHistorico && r.registradoPor.id === usuarioActualId,
  }));

  const confirmarEliminar = (id: number) => {
    if (window.confirm("¿Eliminar este caso de anemia? Esta acción no se puede deshacer.")) {
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
            columnaExtra="Observaciones"
            emptyMessage="Sin casos de anemia registrados"
          />
        </CardContent>
      </Card>

      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}

      <AnemiaFormDialog open={dialogOpen} onOpenChange={setDialogOpen} registro={registroEnEdicion} />
      <AnemiaDetalleDialog open={detalleOpen} onOpenChange={setDetalleOpen} registro={registroEnVista} />
    </div>
  );
}
