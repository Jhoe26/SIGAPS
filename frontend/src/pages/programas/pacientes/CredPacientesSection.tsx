import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { DxNutricionalBadge } from "@/components/shared/DxNutricionalBadge";
import { Pagination } from "@/components/shared/Pagination";
import { TablaRegistrosClinicos, type FilaClinica } from "@/components/shared/TablaRegistrosClinicos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCredMayor5List, useCredMenor5List, useEliminarCredMayor5, useEliminarCredMenor5 } from "@/hooks/useCred";
import { CredDetalleDialog } from "@/pages/programas/pacientes/CredDetalleDialog";
import { CredMayor5FormDialog } from "@/pages/programas/pacientes/CredMayor5FormDialog";
import { CredMenor5FormDialog } from "@/pages/programas/pacientes/CredMenor5FormDialog";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { CredMayor5, CredMenor5 } from "@/types/cred";

interface SectionProps {
  senalNuevoRegistro: number;
}

export function CredPacientesSection({ senalNuevoRegistro }: SectionProps) {
  const usuarioActualId = useAuthStore((s) => s.user?.id);
  const [submodulo, setSubmodulo] = useState<"menor5" | "mayor5">("menor5");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registroMenor5, setRegistroMenor5] = useState<CredMenor5 | null>(null);
  const [registroMayor5, setRegistroMayor5] = useState<CredMayor5 | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [registroEnVista, setRegistroEnVista] = useState<CredMenor5 | CredMayor5 | null>(null);

  const listaMenor5 = useCredMenor5List(page);
  const listaMayor5 = useCredMayor5List(page);
  const eliminarMenor5 = useEliminarCredMenor5();
  const eliminarMayor5 = useEliminarCredMayor5();

  useEffect(() => {
    if (senalNuevoRegistro > 0) {
      setRegistroMenor5(null);
      setRegistroMayor5(null);
      setDialogOpen(true);
    }
  }, [senalNuevoRegistro]);

  useEffect(() => {
    setPage(0);
  }, [submodulo]);

  const data = submodulo === "menor5" ? listaMenor5.data : listaMayor5.data;
  const isLoading = submodulo === "menor5" ? listaMenor5.isLoading : listaMayor5.isLoading;

  const filas: FilaClinica[] =
    submodulo === "menor5"
      ? (listaMenor5.data?.content ?? []).map((r) => ({
          id: r.id,
          pacienteNombre: r.paciente.nombreCompleto,
          pacienteDni: r.paciente.dni,
          pacienteFechaNacimiento: r.paciente.fechaNacimiento,
          profesionalNombre: r.profesional?.nombreCompleto ?? null,
          fecha: r.fecha,
          estado: "pendiente",
          estadoBadge: <DxNutricionalBadge dxNutricional={r.dxNutricional} />,
          extra: r.numControl ? `Control N°${r.numControl}` : "—",
          puedeEditar: !r.esHistorico && r.registradoPor.id === usuarioActualId,
        }))
      : (listaMayor5.data?.content ?? []).map((r) => ({
          id: r.id,
          pacienteNombre: r.paciente.nombreCompleto,
          pacienteDni: r.paciente.dni,
          pacienteFechaNacimiento: r.paciente.fechaNacimiento,
          profesionalNombre: r.profesional?.nombreCompleto ?? null,
          fecha: r.fecha,
          estado: "pendiente",
          estadoBadge: <DxNutricionalBadge dxNutricional={r.dxNutricional} />,
          extra: r.numControl ? `Control N°${r.numControl}` : "—",
          puedeEditar: !r.esHistorico && r.registradoPor.id === usuarioActualId,
        }));

  const confirmarEliminar = (id: number) => {
    if (!window.confirm("¿Eliminar este control CRED? Esta acción no se puede deshacer.")) return;
    if (submodulo === "menor5") eliminarMenor5.mutate(id);
    else eliminarMayor5.mutate(id);
  };

  const abrirEdicion = (id: number) => {
    if (submodulo === "menor5") {
      setRegistroMenor5(listaMenor5.data?.content.find((r) => r.id === id) ?? null);
    } else {
      setRegistroMayor5(listaMayor5.data?.content.find((r) => r.id === id) ?? null);
    }
    setDialogOpen(true);
  };

  const abrirVista = (id: number) => {
    const registro =
      submodulo === "menor5"
        ? listaMenor5.data?.content.find((r) => r.id === id)
        : listaMayor5.data?.content.find((r) => r.id === id);
    setRegistroEnVista(registro ?? null);
    setDetalleOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-border p-1">
          {(["menor5", "mayor5"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubmodulo(s)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                submodulo === s ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "menor5" ? "Menor de 5 años" : "Mayor de 5 años"}
            </button>
          ))}
        </div>
        <Button
          onClick={() => {
            setRegistroMenor5(null);
            setRegistroMayor5(null);
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
            columnaExtra="Control"
            emptyMessage="Sin controles CRED registrados"
          />
        </CardContent>
      </Card>

      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}

      {submodulo === "menor5" ? (
        <CredMenor5FormDialog open={dialogOpen} onOpenChange={setDialogOpen} registro={registroMenor5} />
      ) : (
        <CredMayor5FormDialog open={dialogOpen} onOpenChange={setDialogOpen} registro={registroMayor5} />
      )}
      <CredDetalleDialog open={detalleOpen} onOpenChange={setDetalleOpen} registro={registroEnVista} />
    </div>
  );
}
