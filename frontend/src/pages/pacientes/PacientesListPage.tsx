import { Plus, Search } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePacientesQuery } from "@/hooks/usePaciente";
import { PacienteFormDialog } from "@/pages/pacientes/PacienteFormDialog";
import type { Paciente } from "@/types/paciente";

export default function PacientesListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pacienteEnEdicion, setPacienteEnEdicion] = useState<Paciente | null>(null);

  const { data, isLoading } = usePacientesQuery(search, page);

  const abrirNuevo = () => {
    setPacienteEnEdicion(null);
    setDialogOpen(true);
  };

  const abrirEdicion = (paciente: Paciente) => {
    setPacienteEnEdicion(paciente);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pacientes</h1>
        <Button onClick={abrirNuevo}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo paciente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Search className="h-4 w-4" />
            Buscar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="DNI o apellidos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DNI</TableHead>
                <TableHead>Nombre completo</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Seguro</TableHead>
                <TableHead />
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
                  <TableCell>{paciente.dni}</TableCell>
                  <TableCell>{paciente.nombreCompleto}</TableCell>
                  <TableCell>
                    {paciente.edadAnios}a {paciente.edadMeses}m
                  </TableCell>
                  <TableCell>{paciente.sexo}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{paciente.tipoSeguro}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!paciente.esHistorico && (
                      <Button variant="ghost" size="sm" onClick={() => abrirEdicion(paciente)}>
                        Editar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
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

      <PacienteFormDialog open={dialogOpen} onOpenChange={setDialogOpen} paciente={pacienteEnEdicion} />
    </div>
  );
}
