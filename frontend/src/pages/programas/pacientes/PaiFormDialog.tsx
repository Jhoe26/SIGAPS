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
import { useVacunas } from "@/hooks/useCatalogo";
import { useActualizarPai, useCrearPai } from "@/hooks/usePai";
import { paiSchema, type PaiFormValues } from "@/schemas/pai.schema";
import type { Pai, SubmoduloPai } from "@/types/pai";

interface Props {
  submodulo: SubmoduloPai;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: Pai | null;
}

const VALORES_VACIOS: PaiFormValues = {
  pacienteId: 0,
  vacunaId: 0,
  numDosis: 1,
  fechaAplicacion: "",
  lote: "",
  tipoAplicacion: "REGULAR",
  observaciones: "",
};

export function PaiFormDialog({ submodulo, open, onOpenChange, registro }: Props) {
  const esEdicion = !!registro;
  const crear = useCrearPai(submodulo);
  const actualizar = useActualizarPai(submodulo, registro?.id ?? 0);
  const { data: vacunas } = useVacunas();
  const [pacienteLabel, setPacienteLabel] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaiFormValues>({ resolver: zodResolver(paiSchema), defaultValues: VALORES_VACIOS });

  useEffect(() => {
    if (!open) return;
    if (registro) {
      reset({
        pacienteId: registro.paciente.id,
        vacunaId: registro.vacuna?.id ?? 0,
        numDosis: registro.numDosis,
        fechaAplicacion: registro.fechaAplicacion,
        lote: registro.lote ?? "",
        tipoAplicacion: registro.tipoAplicacion,
        observaciones: registro.observaciones ?? "",
      });
      setPacienteLabel(`${registro.paciente.nombreCompleto} — DNI ${registro.paciente.dni}`);
    } else {
      reset(VALORES_VACIOS);
      setPacienteLabel("");
    }
  }, [open, registro, reset]);

  const onSubmit = (values: PaiFormValues) => {
    if (esEdicion) {
      actualizar.mutate(values, { onSuccess: () => onOpenChange(false) });
    } else {
      crear.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const vacunaId = watch("vacunaId");
  const tipoAplicacion = watch("tipoAplicacion");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar dosis" : "Nueva dosis"}</DialogTitle>
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
              <Label>Vacuna</Label>
              <Select value={vacunaId ? String(vacunaId) : undefined} onValueChange={(v) => setValue("vacunaId", Number(v), { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {vacunas?.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vacunaId && <p className="text-sm text-destructive">{errors.vacunaId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numDosis">N.º de dosis</Label>
              <Input id="numDosis" type="number" min={1} {...register("numDosis")} />
              {errors.numDosis && <p className="text-sm text-destructive">{errors.numDosis.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fechaAplicacion">Fecha de aplicación</Label>
              <DateInput id="fechaAplicacion" {...register("fechaAplicacion")} />
              {errors.fechaAplicacion && <p className="text-sm text-destructive">{errors.fechaAplicacion.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lote">Lote</Label>
              <Input id="lote" {...register("lote")} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de aplicación</Label>
              <Select
                value={tipoAplicacion}
                onValueChange={(v) => setValue("tipoAplicacion", v as PaiFormValues["tipoAplicacion"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGULAR">Regular</SelectItem>
                  <SelectItem value="BARRIDO">Barrido</SelectItem>
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
              {esEdicion ? "Guardar cambios" : "Registrar dosis"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
