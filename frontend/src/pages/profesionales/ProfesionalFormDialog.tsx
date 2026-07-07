import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCentros } from "@/hooks/useCentro";
import { useActualizarProfesional, useCrearProfesional } from "@/hooks/useProfesional";
import { TIPOS_COLEGIO } from "@/lib/profesional";
import { profesionalFormSchema, type ProfesionalFormValues } from "@/schemas/profesional.schema";
import type { Profesional } from "@/types/profesional";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: Profesional | null;
}

const VALORES_VACIOS: ProfesionalFormValues = {
  dni: "",
  nombres: "",
  apPaterno: "",
  apMaterno: "",
  especialidad: "",
  colegiatura: "",
  tipoColegio: "",
  activo: true,
};

export function ProfesionalFormDialog({ open, onOpenChange, registro }: Props) {
  const esEdicion = !!registro;
  const crear = useCrearProfesional();
  const actualizar = useActualizarProfesional(registro?.id ?? 0);
  const { data: centros } = useCentros();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfesionalFormValues>({ resolver: zodResolver(profesionalFormSchema), defaultValues: VALORES_VACIOS });

  useEffect(() => {
    if (!open) return;
    if (registro) {
      reset({
        nombres: registro.nombres,
        apPaterno: registro.apPaterno,
        apMaterno: registro.apMaterno,
        especialidad: registro.especialidad ?? "",
        colegiatura: registro.colegiatura ?? "",
        tipoColegio: registro.tipoColegio ?? "",
        centroId: registro.centroId ?? undefined,
        activo: registro.activo,
      });
    } else {
      reset(VALORES_VACIOS);
    }
  }, [open, registro, reset]);

  const onSubmit = (values: ProfesionalFormValues) => {
    if (esEdicion) {
      actualizar.mutate(
        {
          nombres: values.nombres,
          apPaterno: values.apPaterno,
          apMaterno: values.apMaterno,
          especialidad: values.especialidad,
          colegiatura: values.colegiatura,
          tipoColegio: values.tipoColegio,
          centroId: values.centroId,
          activo: values.activo ?? true,
        },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      if (!values.dni) return;
      crear.mutate(
        {
          dni: values.dni,
          nombres: values.nombres,
          apPaterno: values.apPaterno,
          apMaterno: values.apMaterno,
          especialidad: values.especialidad,
          colegiatura: values.colegiatura,
          tipoColegio: values.tipoColegio,
          centroId: values.centroId,
        },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  const tipoColegio = watch("tipoColegio");
  const centroId = watch("centroId");
  const activo = watch("activo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar profesional" : "Nuevo profesional"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            {!esEdicion && (
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="dni">DNI</Label>
                <Input id="dni" maxLength={8} {...register("dni")} />
                {errors.dni && <p className="text-sm text-destructive">{errors.dni.message}</p>}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="nombres">Nombres</Label>
              <Input id="nombres" {...register("nombres")} />
              {errors.nombres && <p className="text-sm text-destructive">{errors.nombres.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apPaterno">Apellido paterno</Label>
              <Input id="apPaterno" {...register("apPaterno")} />
              {errors.apPaterno && <p className="text-sm text-destructive">{errors.apPaterno.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apMaterno">Apellido materno</Label>
              <Input id="apMaterno" {...register("apMaterno")} />
              {errors.apMaterno && <p className="text-sm text-destructive">{errors.apMaterno.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input id="especialidad" {...register("especialidad")} />
            </div>
            <div className="space-y-1.5">
              <Label>Colegio profesional</Label>
              <Select value={tipoColegio || undefined} onValueChange={(v) => setValue("tipoColegio", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_COLEGIO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="colegiatura">N.º de colegiatura</Label>
              <Input id="colegiatura" {...register("colegiatura")} />
            </div>
            <div className="space-y-1.5">
              <Label>Centro de salud</Label>
              <Select
                value={centroId ? String(centroId) : undefined}
                onValueChange={(v) => setValue("centroId", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {centros?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {esEdicion && (
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <input
                  id="activo"
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={activo ?? true}
                  onChange={(e) => setValue("activo", e.target.checked)}
                />
                <Label htmlFor="activo" className="cursor-pointer font-normal">
                  Profesional activo
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending}>
              {esEdicion ? "Guardar cambios" : "Registrar profesional"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
