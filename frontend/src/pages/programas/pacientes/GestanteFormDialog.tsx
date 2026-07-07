import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { DateInput } from "@/components/shared/DateInput";
import { PatientSearch } from "@/components/shared/PatientSearch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActualizarGestante, useCrearGestante } from "@/hooks/useGestante";
import { gestanteFormSchema, type GestanteFormValues } from "@/schemas/gestante.schema";
import type { CreateGestanteInput, Gestante, UpdateGestanteInput } from "@/types/gestante";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: Gestante | null;
}

const VALORES_VACIOS: GestanteFormValues = {
  pacienteId: 0,
  telefono: "",
  influenzaFecha: "",
  dt1Fecha: "",
  dt2Fecha: "",
  dt3Fecha: "",
  hepb1Fecha: "",
  hepb2Fecha: "",
  hepb3Fecha: "",
  tdpaFecha: "",
  observaciones: "",
};

function vacio(v?: string) {
  return v === "" ? undefined : v;
}

export function GestanteFormDialog({ open, onOpenChange, registro }: Props) {
  const esEdicion = !!registro;
  const crear = useCrearGestante();
  const actualizar = useActualizarGestante(registro?.id ?? 0);
  const [pacienteLabel, setPacienteLabel] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GestanteFormValues>({ resolver: zodResolver(gestanteFormSchema), defaultValues: VALORES_VACIOS });

  useEffect(() => {
    if (!open) return;
    if (registro) {
      reset({
        pacienteId: registro.paciente.id,
        telefono: registro.telefono ?? "",
        influenzaFecha: registro.influenzaFecha ?? "",
        dt1Fecha: registro.dt1Fecha ?? "",
        dt2Fecha: registro.dt2Fecha ?? "",
        dt3Fecha: registro.dt3Fecha ?? "",
        hepb1Fecha: registro.hepb1Fecha ?? "",
        hepb2Fecha: registro.hepb2Fecha ?? "",
        hepb3Fecha: registro.hepb3Fecha ?? "",
        tdpaFecha: registro.tdpaFecha ?? "",
        observaciones: registro.observaciones ?? "",
      });
      setPacienteLabel(`${registro.paciente.nombreCompleto} — DNI ${registro.paciente.dni}`);
    } else {
      reset(VALORES_VACIOS);
      setPacienteLabel("");
    }
  }, [open, registro, reset]);

  const onSubmit = (values: GestanteFormValues) => {
    if (esEdicion) {
      const payload: UpdateGestanteInput = {
        telefono: vacio(values.telefono),
        influenzaFecha: vacio(values.influenzaFecha),
        dt1Fecha: vacio(values.dt1Fecha),
        dt2Fecha: vacio(values.dt2Fecha),
        dt3Fecha: vacio(values.dt3Fecha),
        hepb1Fecha: vacio(values.hepb1Fecha),
        hepb2Fecha: vacio(values.hepb2Fecha),
        hepb3Fecha: vacio(values.hepb3Fecha),
        tdpaFecha: vacio(values.tdpaFecha),
        observaciones: vacio(values.observaciones),
      };
      actualizar.mutate(payload, { onSuccess: () => onOpenChange(false) });
    } else {
      if (!values.pacienteId) return;
      const payload: CreateGestanteInput = {
        pacienteId: values.pacienteId,
        telefono: vacio(values.telefono),
        influenzaFecha: vacio(values.influenzaFecha),
        dt1Fecha: vacio(values.dt1Fecha),
        dt2Fecha: vacio(values.dt2Fecha),
        dt3Fecha: vacio(values.dt3Fecha),
        hepb1Fecha: vacio(values.hepb1Fecha),
        hepb2Fecha: vacio(values.hepb2Fecha),
        hepb3Fecha: vacio(values.hepb3Fecha),
        tdpaFecha: vacio(values.tdpaFecha),
        observaciones: vacio(values.observaciones),
      };
      crear.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar registro de gestante" : "Nuevo registro de gestante"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {!esEdicion ? (
            <div className="space-y-1.5">
              <Label>Paciente</Label>
              <PatientSearch
                onSelect={(p) => {
                  setValue("pacienteId", p.id, { shouldValidate: true });
                  setPacienteLabel(`${p.nombreCompleto} — DNI ${p.dni}`);
                }}
              />
              {errors.pacienteId && <p className="text-sm text-destructive">{errors.pacienteId.message}</p>}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Paciente</Label>
              <Input value={pacienteLabel} disabled />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register("telefono")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="influenzaFecha">Influenza</Label>
              <DateInput id="influenzaFecha" {...register("influenzaFecha")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tdpaFecha">Tdpa</Label>
              <DateInput id="tdpaFecha" {...register("tdpaFecha")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dt1Fecha">DT — 1.ª dosis</Label>
              <DateInput id="dt1Fecha" {...register("dt1Fecha")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dt2Fecha">DT — 2.ª dosis</Label>
              <DateInput id="dt2Fecha" {...register("dt2Fecha")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dt3Fecha">DT — 3.ª dosis</Label>
              <DateInput id="dt3Fecha" {...register("dt3Fecha")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hepb1Fecha">HepB — 1.ª dosis</Label>
              <DateInput id="hepb1Fecha" {...register("hepb1Fecha")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hepb2Fecha">HepB — 2.ª dosis</Label>
              <DateInput id="hepb2Fecha" {...register("hepb2Fecha")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hepb3Fecha">HepB — 3.ª dosis</Label>
              <DateInput id="hepb3Fecha" {...register("hepb3Fecha")} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input id="observaciones" {...register("observaciones")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending}>
              {esEdicion ? "Guardar cambios" : "Registrar gestante"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
