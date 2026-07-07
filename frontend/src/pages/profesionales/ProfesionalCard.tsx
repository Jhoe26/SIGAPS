import { Building2, Users2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { iniciales } from "@/lib/edad";
import { tituloPorColegio } from "@/lib/profesional";
import type { CentroSalud } from "@/types/centro";
import type { Profesional } from "@/types/profesional";

interface Props {
  profesional: Profesional;
  centro: CentroSalud | undefined;
  puedeEditar: boolean;
  onVerPerfil: () => void;
  onEditar: () => void;
}

const COLORES_AVATAR = ["bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700"];

function colorAvatar(id: number) {
  return COLORES_AVATAR[id % COLORES_AVATAR.length];
}

export function ProfesionalCard({ profesional, centro, puedeEditar, onVerPerfil, onEditar }: Props) {
  const titulo = tituloPorColegio(profesional.tipoColegio);
  const colegiatura =
    profesional.tipoColegio && profesional.colegiatura ? `${profesional.tipoColegio}-${profesional.colegiatura}` : null;

  return (
    <Card className="flex flex-col">
      <CardContent className="flex-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colorAvatar(profesional.id)}`}>
              {iniciales(profesional.nombreCompleto)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {titulo ? `${titulo} ` : ""}
                {profesional.nombreCompleto}
              </p>
              <p className="truncate text-sm text-muted-foreground">{profesional.especialidad ?? "Sin especialidad"}</p>
            </div>
          </div>
          <Badge variant={profesional.activo ? "default" : "secondary"} className="shrink-0">
            {profesional.activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {colegiatura && <p>{colegiatura}</p>}
          <p className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{centro?.nombre ?? "Sin centro asignado"}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Users2 className="h-3.5 w-3.5 shrink-0" />
            {profesional.totalPacientesAtendidos} pacientes
          </p>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 pt-0">
        <Button variant="outline" size="sm" onClick={onVerPerfil}>
          Ver perfil
        </Button>
        {puedeEditar && (
          <Button variant="outline" size="sm" onClick={onEditar}>
            Editar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
