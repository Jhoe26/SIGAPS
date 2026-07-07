import { Eye, Pencil, Plug, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useCentros } from "@/hooks/useCentro";
import { useSistemaInfo } from "@/hooks/useSistema";
import { AuditoriaDialog } from "@/pages/configuracion/AuditoriaDialog";
import { CentroFormDialog } from "@/pages/configuracion/CentroFormDialog";
import { ParametroViewDialog } from "@/pages/configuracion/ParametroViewDialog";
import type { CentroSalud } from "@/types/centro";

const proximamente = () => toast.info("Disponible próximamente");

const PARAMETROS_CLINICOS = [
  { titulo: "Tablas de crecimiento OMS", clave: null as string | null },
  { titulo: "Valores de referencia Hb", clave: "HB_CORRECCION_AYACUCHO" },
  { titulo: "Calendarios de vacunación", clave: null as string | null },
];

const INTEGRACIONES = ["HIS MINSA", "SIS", "RENIEC"];

function ConfigRow({
  label,
  onVer,
  onEditar,
}: {
  label: string;
  onVer: () => void;
  onEditar: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-secondary/50">
      <span className="truncate text-sm text-foreground">{label}</span>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" onClick={onVer} aria-label={`Ver ${label}`}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onEditar} aria-label={`Editar ${label}`}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ConfiguracionPage() {
  const { data: centros } = useCentros();
  const { data: sistemaInfo, isLoading: cargandoSistema } = useSistemaInfo();

  const [centroDialogOpen, setCentroDialogOpen] = useState(false);
  const [centroSeleccionado, setCentroSeleccionado] = useState<CentroSalud | null>(null);

  const [parametroDialogOpen, setParametroDialogOpen] = useState(false);
  const [parametroSeleccionado, setParametroSeleccionado] = useState<{ titulo: string; clave: string | null }>({
    titulo: "",
    clave: null,
  });

  const [auditoriaOpen, setAuditoriaOpen] = useState(false);

  const abrirParametro = (titulo: string, clave: string | null) => {
    setParametroSeleccionado({ titulo, clave });
    setParametroDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground">Parámetros generales del sistema SIGAPS</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Centros de Salud</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {centros?.map((c) => (
              <ConfigRow
                key={c.id}
                label={c.nombre}
                onVer={() => toast.info(`${c.nombre} — Ubigeo: ${c.ubigeo ?? "N/D"} — ${c.direccion ?? "Sin dirección registrada"}`)}
                onEditar={() => {
                  setCentroSeleccionado(c);
                  setCentroDialogOpen(true);
                }}
              />
            ))}
            {(centros?.length ?? 0) === 0 && <p className="px-2 py-2 text-sm text-muted-foreground">Sin centros registrados</p>}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => {
                setCentroSeleccionado(null);
                setCentroDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar nuevo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parámetros Clínicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {PARAMETROS_CLINICOS.map((p) => (
              <ConfigRow key={p.titulo} label={p.titulo} onVer={() => abrirParametro(p.titulo, p.clave)} onEditar={proximamente} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plug className="h-4 w-4" />
              Integraciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {INTEGRACIONES.map((nombre) => (
              <ConfigRow
                key={nombre}
                label={nombre}
                onVer={() => toast.info(`${nombre}: integración aún no configurada`)}
                onEditar={proximamente}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" />
              Seguridad y Acceso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <ConfigRow
              label="Política de contraseñas"
              onVer={() => toast.info("Contraseña mínima: 8 caracteres. Almacenamiento con hash BCrypt.")}
              onEditar={proximamente}
            />
            <ConfigRow
              label="Roles y permisos"
              onVer={() => toast.info("Roles del sistema: Administrador, Médico, Enfermera, Obstetra, Supervisor")}
              onEditar={proximamente}
            />
            <ConfigRow label="Registro de auditoría del sistema" onVer={() => setAuditoriaOpen(true)} onEditar={proximamente} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-1/2 font-medium text-muted-foreground">Versión</TableCell>
                <TableCell>{cargandoSistema ? "Cargando..." : sistemaInfo?.version}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">Base de datos</TableCell>
                <TableCell>{cargandoSistema ? "Cargando..." : sistemaInfo?.baseDatos}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">Entorno</TableCell>
                <TableCell>{cargandoSistema ? "Cargando..." : sistemaInfo?.entorno}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">Última actualización</TableCell>
                <TableCell>
                  {cargandoSistema
                    ? "Cargando..."
                    : sistemaInfo?.ultimaActualizacion?.replace("T", " ") ?? "Sin registros"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CentroFormDialog open={centroDialogOpen} onOpenChange={setCentroDialogOpen} registro={centroSeleccionado} />
      <ParametroViewDialog
        open={parametroDialogOpen}
        onOpenChange={setParametroDialogOpen}
        titulo={parametroSeleccionado.titulo}
        clave={parametroSeleccionado.clave}
      />
      <AuditoriaDialog open={auditoriaOpen} onOpenChange={setAuditoriaOpen} />
    </div>
  );
}
