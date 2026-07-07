import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Pagination } from "@/components/shared/Pagination";
import { TablaRegistrosClinicos, type FilaClinica } from "@/components/shared/TablaRegistrosClinicos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEliminarPai, usePaiList } from "@/hooks/usePai";
import { PaiFormDialog } from "@/pages/programas/pacientes/PaiFormDialog";
import { useAuthStore } from "@/stores/authStore";
import { SUBMODULOS_PAI, type Pai, type SubmoduloPai } from "@/types/pai";

interface SectionProps {
  senalNuevoRegistro: number;
}

export function PaiPacientesSection({ senalNuevoRegistro }: SectionProps) {
  const usuarioActualId = useAuthStore((s) => s.user?.id);
  const [submodulo, setSubmodulo] = useState<SubmoduloPai>("pai-menor12m");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registroEnEdicion, setRegistroEnEdicion] = useState<Pai | null>(null);

  const { data, isLoading } = usePaiList(submodulo, page);
  const eliminar = useEliminarPai(submodulo);

  useEffect(() => {
    if (senalNuevoRegistro > 0) {
      setRegistroEnEdicion(null);
      setDialogOpen(true);
    }
  }, [senalNuevoRegistro]);

  useEffect(() => {
    setPage(0);
  }, [submodulo]);

  const filas: FilaClinica[] = (data?.content ?? []).map((r) => ({
    id: r.id,
    pacienteNombre: r.paciente.nombreCompleto,
    pacienteDni: r.paciente.dni,
    pacienteFechaNacimiento: r.paciente.fechaNacimiento,
    profesionalNombre: r.profesional?.nombreCompleto ?? null,
    fecha: r.fechaAplicacion,
    estado: r.esHistorico ? "inactivo" : r.tipoAplicacion === "REGULAR" ? "activo" : "pendiente",
    estadoEtiqueta: r.esHistorico ? "Histórico" : r.tipoAplicacion === "REGULAR" ? "Regular" : "Barrido",
    puedeEditar: !r.esHistorico && r.registradoPor.id === usuarioActualId,
  }));

  const confirmarEliminar = (id: number) => {
    if (window.confirm("¿Eliminar esta dosis? Esta acción no se puede deshacer.")) {
      eliminar.mutate(id);
    }
  };

  const abrirEdicion = (id: number) => {
    setRegistroEnEdicion(data?.content.find((r) => r.id === id) ?? null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-lg border border-border p-1">
          {SUBMODULOS_PAI.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSubmodulo(s.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                submodulo === s.value ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
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
            emptyMessage="Sin dosis registradas"
          />
        </CardContent>
      </Card>

      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}

      <PaiFormDialog submodulo={submodulo} open={dialogOpen} onOpenChange={setDialogOpen} registro={registroEnEdicion} />
    </div>
  );
}
