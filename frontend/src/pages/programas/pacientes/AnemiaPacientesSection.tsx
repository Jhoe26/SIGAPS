import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Pagination } from "@/components/shared/Pagination";
import { TablaRegistrosClinicos, type FilaClinica } from "@/components/shared/TablaRegistrosClinicos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnemiaList, useEliminarAnemia } from "@/hooks/useAnemia";
import { AnemiaFormDialog } from "@/pages/programas/pacientes/AnemiaFormDialog";
import { useAuthStore } from "@/stores/authStore";
import type { Anemia } from "@/types/anemia";

interface SectionProps {
  senalNuevoRegistro: number;
}

const ETIQUETAS_ESTADO: Record<Anemia["estado"], string> = {
  EN_TRATAMIENTO: "En tratamiento",
  RECUPERADO: "Recuperado",
  ABANDONO: "Abandono",
  TRASLADADO: "Trasladado",
};

export function AnemiaPacientesSection({ senalNuevoRegistro }: SectionProps) {
  const usuarioActualId = useAuthStore((s) => s.user?.id);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registroEnEdicion, setRegistroEnEdicion] = useState<Anemia | null>(null);

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
    estado: r.esHistorico ? "inactivo" : r.estado === "EN_TRATAMIENTO" ? "en_tratamiento" : r.estado === "RECUPERADO" ? "activo" : "inactivo",
    estadoEtiqueta: r.esHistorico ? "Histórico" : ETIQUETAS_ESTADO[r.estado],
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
            emptyMessage="Sin casos de anemia registrados"
          />
        </CardContent>
      </Card>

      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}

      <AnemiaFormDialog open={dialogOpen} onOpenChange={setDialogOpen} registro={registroEnEdicion} />
    </div>
  );
}
