import { HeartPulse, Plus, RotateCcw, ShieldCheck, Stethoscope, Trash2, UserCog } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCentros } from "@/hooks/useCentro";
import { useActivarUsuario, useDesactivarUsuario, useUsuarioStats, useUsuariosList } from "@/hooks/useUsuario";
import { iniciales } from "@/lib/edad";
import { ROL_BADGE_CLASS, ROL_LABEL } from "@/lib/rol";
import { tiempoRelativo } from "@/lib/tiempo";
import { UsuarioFormDialog } from "@/pages/usuarios/UsuarioFormDialog";
import type { Usuario } from "@/types/usuario";

export default function UsuariosPage() {
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState<Usuario | null>(null);

  const { data: stats } = useUsuarioStats();
  const { data, isLoading } = useUsuariosList(page);
  const { data: centros } = useCentros();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();

  const abrirCrear = () => {
    setSeleccionado(null);
    setDialogOpen(true);
  };

  const abrirEditar = (u: Usuario) => {
    setSeleccionado(u);
    setDialogOpen(true);
  };

  const alternarEstado = (u: Usuario) => {
    if (u.activo) {
      if (window.confirm(`¿Desactivar a ${u.nombreCompleto}? Perderá acceso al sistema.`)) {
        desactivar.mutate(u.id);
      }
    } else {
      activar.mutate(u.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Gestión de Usuarios del Sistema</h1>
        <Button onClick={abrirCrear}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShieldCheck} label="Administradores" valor={stats?.administradores ?? 0} colorClassName="bg-purple-100 text-purple-700" />
        <StatCard icon={Stethoscope} label="Médicos" valor={stats?.medicos ?? 0} colorClassName="bg-blue-100 text-blue-700" />
        <StatCard icon={HeartPulse} label="Enfermeras/Obstétricas" valor={stats?.enfermerasObstetras ?? 0} colorClassName="bg-emerald-100 text-emerald-700" />
        <StatCard icon={UserCog} label="Supervisores" valor={stats?.supervisores ?? 0} colorClassName="bg-amber-100 text-amber-700" />
      </div>

      <Card>
        <CardContent className="p-0">
          {!isLoading && (data?.content.length ?? 0) === 0 ? (
            <EmptyState mensaje="No hay usuarios registrados" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Centro</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Cargando...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  data?.content.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-active/10 text-xs font-semibold text-active">
                            {iniciales(u.nombreCompleto)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{u.nombreCompleto}</p>
                            <p className="text-xs text-muted-foreground">DNI {u.dni}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{u.email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ROL_BADGE_CLASS[u.rol]}>
                          {ROL_LABEL[u.rol]}
                        </Badge>
                      </TableCell>
                      <TableCell>{centros?.find((c) => c.id === u.centroId)?.nombre ?? "—"}</TableCell>
                      <TableCell>{u.ultimoAcceso ? tiempoRelativo(u.ultimoAcceso) : "Nunca"}</TableCell>
                      <TableCell>
                        <Badge variant={u.activo ? "default" : "secondary"}>{u.activo ? "Activo" : "Inactivo"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!u.esSistema && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => abrirEditar(u)} aria-label="Editar">
                              <UserCog className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={u.activo ? "text-destructive hover:text-destructive" : ""}
                              onClick={() => alternarEstado(u)}
                              aria-label={u.activo ? "Desactivar" : "Reactivar"}
                            >
                              {u.activo ? <Trash2 className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}

      <UsuarioFormDialog open={dialogOpen} onOpenChange={setDialogOpen} registro={seleccionado} />
    </div>
  );
}
