import { Plus, Search, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCentros } from "@/hooks/useCentro";
import { useProfesionalesList } from "@/hooks/useProfesional";
import { ProfesionalCard } from "@/pages/profesionales/ProfesionalCard";
import { ProfesionalFormDialog } from "@/pages/profesionales/ProfesionalFormDialog";
import { ProfesionalViewDialog } from "@/pages/profesionales/ProfesionalViewDialog";
import { useAuthStore } from "@/stores/authStore";
import type { Profesional } from "@/types/profesional";

export default function ProfesionalesPage() {
  const esAdmin = useAuthStore((s) => s.user?.rol === "ADMIN");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState<Profesional | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [busqueda]);

  const { data, isLoading } = useProfesionalesList(busquedaDebounced, page);
  const { data: centros } = useCentros();

  const abrirCrear = () => {
    setSeleccionado(null);
    setDialogOpen(true);
  };

  const abrirEditar = (p: Profesional) => {
    setSeleccionado(p);
    setDialogOpen(true);
  };

  const abrirPerfil = (p: Profesional) => {
    setSeleccionado(p);
    setViewOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar profesional..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {esAdmin && (
          <Button onClick={abrirCrear}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Profesional
          </Button>
        )}
      </div>

      {!isLoading && (data?.content.length ?? 0) === 0 ? (
        <EmptyState
          icon={UserRound}
          mensaje={
            busquedaDebounced
              ? "No se encontraron profesionales con ese criterio de búsqueda"
              : "No hay profesionales registrados"
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.content ?? []).map((p) => (
            <ProfesionalCard
              key={p.id}
              profesional={p}
              centro={centros?.find((c) => c.id === p.centroId)}
              puedeEditar={esAdmin}
              onVerPerfil={() => abrirPerfil(p)}
              onEditar={() => abrirEditar(p)}
            />
          ))}
        </div>
      )}

      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}

      <ProfesionalFormDialog open={dialogOpen} onOpenChange={setDialogOpen} registro={seleccionado} />
      <ProfesionalViewDialog open={viewOpen} onOpenChange={setViewOpen} profesional={seleccionado} />
    </div>
  );
}
