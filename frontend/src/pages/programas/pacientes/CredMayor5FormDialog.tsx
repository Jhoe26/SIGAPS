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
import { useActualizarCredMayor5, useCrearCredMayor5 } from "@/hooks/useCred";
import { credMayor5Schema, type CredMayor5FormValues } from "@/schemas/cred.schema";
import type { CredMayor5 } from "@/types/cred";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: CredMayor5 | null;
}

const DX_OPCIONES = [
  { value: "NORMAL", label: "Normal" },
  { value: "RECUPERADO", label: "Recuperado" },
  { value: "SOBREPESO", label: "Sobrepeso" },
  { value: "OBESO", label: "Obeso" },
  { value: "DESNUTRICION_CRONICA", label: "Desnutrición crónica" },
];

const VALORES_VACIOS: CredMayor5FormValues = {
  pacienteId: 0,
  fecha: "",
  edadPuntual: "",
  peso: 0,
  talla: 0,
  dxNutricional: "NORMAL",
  observaciones: "",
};

export function CredMayor5FormDialog({ open, onOpenChange, registro }: Props) {
  const esEdicion = !!registro;
  const crear = useCrearCredMayor5();
  const actualizar = useActualizarCredMayor5(registro?.id ?? 0);
  const [pacienteLabel, setPacienteLabel] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CredMayor5FormValues>({ resolver: zodResolver(credMayor5Schema), defaultValues: VALORES_VACIOS });

  useEffect(() => {
    if (!open) return;
    if (registro) {
      reset({
        pacienteId: registro.paciente.id,
        fecha: registro.fecha,
        edadPuntual: registro.edadPuntual ?? "",
        numControl: registro.numControl ?? undefined,
        peso: registro.peso ?? 0,
        talla: registro.talla ?? 0,
        riesgoNutricional: registro.riesgoNutricional ?? undefined,
        dxNutricional: registro.dxNutricional,
        observaciones: registro.observaciones ?? "",
      });
      setPacienteLabel(`${registro.paciente.nombreCompleto} — DNI ${registro.paciente.dni}`);
    } else {
      reset(VALORES_VACIOS);
      setPacienteLabel("");
    }
  }, [open, registro, reset]);

  const onSubmit = (values: CredMayor5FormValues) => {
    if (esEdicion) {
      actualizar.mutate(values, { onSuccess: () => onOpenChange(false) });
    } else {
      crear.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const dx = watch("dxNutricional");
  const riesgo = watch("riesgoNutricional");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar control CRED" : "Nuevo control CRED (mayor de 5 años)"}</DialogTitle>
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
            <div className="space-y-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <DateInput id="fecha" {...register("fecha")} />
              {errors.fecha && <p className="text-sm text-destructive">{errors.fecha.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edadPuntual">Edad puntual</Label>
              <Input id="edadPuntual" {...register("edadPuntual")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input id="peso" type="number" step="0.01" {...register("peso")} />
              {errors.peso && <p className="text-sm text-destructive">{errors.peso.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="talla">Talla (metros)</Label>
              <Input id="talla" type="number" step="0.01" placeholder="Ej: 1.65" {...register("talla")} />
              {errors.talla && <p className="text-sm text-destructive">{errors.talla.message}</p>}
              <p className="text-xs text-muted-foreground">El IMC se calcula automáticamente.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Riesgo nutricional</Label>
              <Select
                value={riesgo}
                onValueChange={(v) => setValue("riesgoNutricional", v as CredMayor5FormValues["riesgoNutricional"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAJO">Bajo</SelectItem>
                  <SelectItem value="MEDIO">Medio</SelectItem>
                  <SelectItem value="ALTO">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Diagnóstico nutricional</Label>
              <Select value={dx} onValueChange={(v) => setValue("dxNutricional", v as CredMayor5FormValues["dxNutricional"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DX_OPCIONES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input id="observaciones" {...register("observaciones")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending}>
              {esEdicion ? "Guardar cambios" : "Registrar control"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
