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
import { useActualizarAnemia, useCrearAnemia } from "@/hooks/useAnemia";
import { anemiaFormSchema, type AnemiaFormValues } from "@/schemas/anemia.schema";
import type { Anemia, CreateAnemiaInput, UpdateAnemiaInput } from "@/types/anemia";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: Anemia | null;
}

const DX_OPCIONES = [
  { value: "LEVE", label: "Leve" },
  { value: "MODERADA", label: "Moderada" },
  { value: "SEVERA", label: "Severa" },
];

const HIERRO_OPCIONES = [
  { value: "SULFATO_FERROSO", label: "Sulfato ferroso" },
  { value: "HIERRO_POLIMALTOSADO", label: "Hierro polimaltosado" },
  { value: "OTRO", label: "Otro" },
];

const ESTADO_OPCIONES = [
  { value: "EN_TRATAMIENTO", label: "En tratamiento" },
  { value: "RECUPERADO", label: "Recuperado" },
  { value: "ABANDONO", label: "Abandono" },
  { value: "TRASLADADO", label: "Trasladado" },
];

const VALORES_VACIOS: AnemiaFormValues = {
  pacienteId: 0,
  fechaInicio: "",
  dxInicial: "LEVE",
  dosisIndicada: "",
  observaciones: "",
};

export function AnemiaFormDialog({ open, onOpenChange, registro }: Props) {
  const esEdicion = !!registro;
  const crear = useCrearAnemia();
  const actualizar = useActualizarAnemia(registro?.id ?? 0);
  const [pacienteLabel, setPacienteLabel] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnemiaFormValues>({ resolver: zodResolver(anemiaFormSchema), defaultValues: VALORES_VACIOS });

  useEffect(() => {
    if (!open) return;
    if (registro) {
      reset({
        pacienteId: registro.paciente.id,
        fechaInicio: registro.fechaInicio,
        hbInicialObs: registro.hbInicialObs ?? undefined,
        dxInicial: registro.dxInicial,
        tipoHierro: registro.tipoHierro ?? undefined,
        dosisIndicada: registro.dosisIndicada ?? "",
        estado: registro.estado,
        observaciones: registro.observaciones ?? "",
      });
      setPacienteLabel(`${registro.paciente.nombreCompleto} — DNI ${registro.paciente.dni}`);
    } else {
      reset(VALORES_VACIOS);
      setPacienteLabel("");
    }
  }, [open, registro, reset]);

  const onSubmit = (values: AnemiaFormValues) => {
    if (esEdicion) {
      const payload: UpdateAnemiaInput = {
        fechaInicio: values.fechaInicio,
        hbInicialObs: values.hbInicialObs,
        dxInicial: values.dxInicial,
        tipoHierro: values.tipoHierro,
        dosisIndicada: values.dosisIndicada,
        estado: values.estado ?? "EN_TRATAMIENTO",
        observaciones: values.observaciones,
      };
      actualizar.mutate(payload, { onSuccess: () => onOpenChange(false) });
    } else {
      if (!values.pacienteId) return;
      const payload: CreateAnemiaInput = {
        pacienteId: values.pacienteId,
        fechaInicio: values.fechaInicio,
        hbInicialObs: values.hbInicialObs,
        dxInicial: values.dxInicial,
        tipoHierro: values.tipoHierro,
        dosisIndicada: values.dosisIndicada,
      };
      crear.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const dxInicial = watch("dxInicial");
  const tipoHierro = watch("tipoHierro");
  const estado = watch("estado");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar caso de anemia" : "Nuevo caso de anemia"}</DialogTitle>
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
              <Label htmlFor="fechaInicio">Fecha de inicio</Label>
              <DateInput id="fechaInicio" {...register("fechaInicio")} />
              {errors.fechaInicio && <p className="text-sm text-destructive">{errors.fechaInicio.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hbInicialObs">Hb inicial observada (g/dL)</Label>
              <Input id="hbInicialObs" type="number" step="0.1" {...register("hbInicialObs")} />
            </div>
            <div className="space-y-1.5">
              <Label>Diagnóstico inicial</Label>
              <Select value={dxInicial} onValueChange={(v) => setValue("dxInicial", v as AnemiaFormValues["dxInicial"])}>
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
            <div className="space-y-1.5">
              <Label>Tipo de hierro</Label>
              <Select
                value={tipoHierro ?? undefined}
                onValueChange={(v) => setValue("tipoHierro", v as AnemiaFormValues["tipoHierro"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {HIERRO_OPCIONES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="dosisIndicada">Dosis indicada</Label>
              <Input id="dosisIndicada" {...register("dosisIndicada")} />
            </div>
            {esEdicion && (
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={estado} onValueChange={(v) => setValue("estado", v as AnemiaFormValues["estado"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADO_OPCIONES.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input id="observaciones" {...register("observaciones")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending}>
              {esEdicion ? "Guardar cambios" : "Registrar caso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
