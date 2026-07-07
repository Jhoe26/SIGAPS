import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { DateInput } from "@/components/shared/DateInput";
import { PatientSearch } from "@/components/shared/PatientSearch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActualizarTamizaje, useCrearTamizaje } from "@/hooks/useTamizaje";
import { tamizajeSchema, type TamizajeFormValues } from "@/schemas/tamizaje.schema";
import { GRUPOS_ETARIOS_TAMIZAJE, type TamizajeHb } from "@/types/tamizaje";

interface TamizajeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: TamizajeHb | null;
}

const VALORES_VACIOS: TamizajeFormValues = {
  pacienteId: 0,
  fecha: "",
  grupoEtario: "",
  tipoDosaje: "DOSAJE",
  hbObservado: undefined,
  observaciones: "",
};

export function TamizajeFormDialog({ open, onOpenChange, registro }: TamizajeFormDialogProps) {
  const esEdicion = !!registro;
  const crear = useCrearTamizaje();
  const actualizar = useActualizarTamizaje(registro?.id ?? 0);
  const [pacienteLabel, setPacienteLabel] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TamizajeFormValues>({
    resolver: zodResolver(tamizajeSchema),
    defaultValues: VALORES_VACIOS,
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    if (registro) {
      reset({
        pacienteId: registro.paciente.id,
        fecha: registro.fecha,
        grupoEtario: registro.grupoEtario,
        tipoDosaje: registro.tipoDosaje,
        hbObservado: registro.hbObservado ?? undefined,
        observaciones: registro.observaciones ?? "",
      });
      setPacienteLabel(`${registro.paciente.nombreCompleto} — DNI ${registro.paciente.dni}`);
    } else {
      reset(VALORES_VACIOS);
      setPacienteLabel("");
    }
  }, [open, registro, reset]);

  const onSubmit = (values: TamizajeFormValues) => {
    if (esEdicion) {
      actualizar.mutate(values, { onSuccess: () => onOpenChange(false) });
    } else {
      crear.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const grupoEtarioActual = watch("grupoEtario");
  const tipoDosajeActual = watch("tipoDosaje");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar tamizaje" : "Nuevo tamizaje"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {!esEdicion && (
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
          )}
          {esEdicion && (
            <div className="space-y-1.5">
              <Label>Paciente</Label>
              <Input value={pacienteLabel} disabled />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <DateInput id="fecha" {...register("fecha")} />
              {errors.fecha && <p className="text-sm text-destructive">{errors.fecha.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Grupo etario</Label>
              <Select value={grupoEtarioActual} onValueChange={(v) => setValue("grupoEtario", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {GRUPOS_ETARIOS_TAMIZAJE.map((grupo) => (
                    <SelectItem key={grupo.value} value={grupo.value}>
                      {grupo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grupoEtario && <p className="text-sm text-destructive">{errors.grupoEtario.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de dosaje</Label>
              <Select
                value={tipoDosajeActual}
                onValueChange={(v) => setValue("tipoDosaje", v as TamizajeFormValues["tipoDosaje"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOSAJE">Dosaje</SelectItem>
                  <SelectItem value="SIN_DOSAJE">Sin dosaje</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hbObservado">Hb observada (g/dL)</Label>
              <Input id="hbObservado" type="number" step="0.01" {...register("hbObservado")} />
              {errors.hbObservado && <p className="text-sm text-destructive">{errors.hbObservado.message}</p>}
              <p className="text-xs text-muted-foreground">La Hb corregida se calcula automáticamente.</p>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input id="observaciones" {...register("observaciones")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending}>
              {esEdicion ? "Guardar cambios" : "Registrar tamizaje"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
