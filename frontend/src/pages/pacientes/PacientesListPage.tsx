import { Download, Eye, Pencil, Plus, Printer, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportarPacientes, usePacientesQuery } from "@/hooks/usePaciente";
import { iniciales } from "@/lib/edad";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
import { PacienteFormDialog } from "@/pages/pacientes/PacienteFormDialog";
import type { Paciente } from "@/types/paciente";

const ESTILO_SEXO: Record<"M" | "F", string> = {
  F: "bg-pink-50 text-pink-700",
  M: "bg-sky-50 text-sky-700",
};

const ETIQUETA_SEXO: Record<"M" | "F", string> = {
  F: "Fem.",
  M: "Masc.",
};

const TODOS = "TODOS";

const ESTADOS = [
  { value: TODOS, label: "Todos los estados" },
  { value: "ACTIVO", label: "Activo" },
  { value: "EN_TRATAMIENTO", label: "En tratamiento" },
  { value: "RECUPERADO", label: "Recuperado" },
  { value: "HISTORICO", label: "Histórico" },
];

const PROGRAMAS_FILTRO = [
  { value: TODOS, label: "Todos los programas" },
  { value: "TAMIZAJE", label: "Tamizaje" },
  { value: "ANEMIA", label: "Anemia" },
  { value: "CRED_MENOR5", label: "CRED <5" },
  { value: "CRED_MAYOR5", label: "CRED >5" },
  { value: "PAI_MENOR12M", label: "PAI <12M" },
  { value: "PAI_12M_5A", label: "PAI 12M-5A" },
  { value: "PAI_MAYOR5A", label: "PAI >5A" },
  { value: "PAI_7A_15A", label: "PAI 7-15A" },
  { value: "GESTACIONAL", label: "Gestacional" },
];

const DEBOUNCE_BUSQUEDA_MS = 500;

export default function PacientesListPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") ?? "");
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pacienteEnEdicion, setPacienteEnEdicion] = useState<Paciente | null>(null);
  const [soloLectura, setSoloLectura] = useState(false);
  const [estado, setEstado] = useState("");
  const [programa, setPrograma] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, DEBOUNCE_BUSQUEDA_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = usePacientesQuery(search, page, estado, programa);

  const abrirNuevo = () => {
    setPacienteEnEdicion(null);
    setSoloLectura(false);
    setDialogOpen(true);
  };

  useEffect(() => {
    if (location.pathname.endsWith("/nuevo")) {
      abrirNuevo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const confirmarEliminar = (paciente: Paciente) => {
    const confirmado = window.confirm(`¿Eliminar a ${paciente.nombreCompleto}?`);
    if (confirmado) {
      toast.info("Eliminar pacientes no está disponible en este sistema");
    }
  };

  const abrirEdicion = (paciente: Paciente) => {
    setPacienteEnEdicion(paciente);
    setSoloLectura(false);
    setDialogOpen(true);
  };

  const abrirVista = (paciente: Paciente) => {
    setPacienteEnEdicion(paciente);
    setSoloLectura(true);
    setDialogOpen(true);
  };

  const cambiarEstado = (valor: string) => {
    setEstado(valor === TODOS ? "" : valor);
    setPage(0);
  };

  const cambiarPrograma = (valor: string) => {
    setPrograma(valor === TODOS ? "" : valor);
    setPage(0);
  };

  const imprimir = () => window.print();

  const [exportando, setExportando] = useState(false);
  const exportar = async () => {
    setExportando(true);
    try {
      await exportarPacientes(search, estado, programa);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo exportar el listado de pacientes"));
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Pacientes</h1>

      <div className="flex flex-row flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 print:hidden">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o DNI..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={estado || TODOS} onValueChange={cambiarEstado}>
          <SelectTrigger className="w-[180px] shrink-0">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={programa || TODOS} onValueChange={cambiarPrograma}>
          <SelectTrigger className="w-[190px] shrink-0">
            <SelectValue placeholder="Todos los programas" />
          </SelectTrigger>
          <SelectContent>
            {PROGRAMAS_FILTRO.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" className="shrink-0" onClick={exportar} disabled={exportando}>
          <Download className="mr-2 h-4 w-4" />
          {exportando ? "Exportando..." : "Exportar"}
        </Button>

        <Button variant="outline" className="shrink-0 print:hidden" onClick={imprimir}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>

        <Button className="shrink-0" onClick={abrirNuevo}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Paciente
        </Button>
      </div>

      {data && data.totalElements > 0 && (
        <p className="text-xs text-muted-foreground">
          Mostrando {data.number * data.size + 1}-{Math.min((data.number + 1) * data.size, data.totalElements)} de{" "}
          {data.totalElements.toLocaleString("es-PE")} pacientes encontrados
        </p>
      )}
      {data && data.totalElements === 0 && <p className="text-xs text-muted-foreground">0 pacientes encontrados</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DNI</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Seguro</TableHead>
                <TableHead className="print:hidden" />
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
              {!isLoading && data?.content.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Sin resultados
                  </TableCell>
                </TableRow>
              )}
              {data?.content.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="text-muted-foreground">{paciente.dni}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-active/10 text-xs font-semibold text-active">
                        {iniciales(paciente.nombreCompleto)}
                      </div>
                      <span className="font-medium text-foreground">{paciente.nombreCompleto}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {paciente.edadAnios}a {paciente.edadMeses}m
                  </TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", ESTILO_SEXO[paciente.sexo])}>
                      {ETIQUETA_SEXO[paciente.sexo]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{paciente.tipoSeguro}</Badge>
                  </TableCell>
                  <TableCell className="text-right print:hidden">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => abrirVista(paciente)} aria-label="Ver">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={paciente.esHistorico}
                        onClick={() => abrirEdicion(paciente)}
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={paciente.esHistorico}
                        onClick={() => confirmarEliminar(paciente)}
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
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 print:hidden">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}

      <PacienteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paciente={pacienteEnEdicion}
        soloLectura={soloLectura}
      />
    </div>
  );
}
