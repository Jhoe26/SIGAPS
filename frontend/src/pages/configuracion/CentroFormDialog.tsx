import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActualizarCentro, useCrearCentro } from "@/hooks/useCentro";
import { centroFormSchema, type CentroFormValues } from "@/schemas/centro.schema";
import type { CentroSalud } from "@/types/centro";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: CentroSalud | null;
}

const VALORES_VACIOS: CentroFormValues = { nombre: "", ubigeo: "", direccion: "", activo: true };

export function CentroFormDialog({ open, onOpenChange, registro }: Props) {
  const esEdicion = !!registro;
  const crear = useCrearCentro();
  const actualizar = useActualizarCentro(registro?.id ?? 0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CentroFormValues>({ resolver: zodResolver(centroFormSchema), defaultValues: VALORES_VACIOS });

  useEffect(() => {
    if (!open) return;
    if (registro) {
      reset({
        nombre: registro.nombre,
        ubigeo: registro.ubigeo ?? "",
        direccion: registro.direccion ?? "",
        activo: registro.activo,
      });
    } else {
      reset(VALORES_VACIOS);
    }
  }, [open, registro, reset]);

  const onSubmit = (values: CentroFormValues) => {
    if (esEdicion) {
      actualizar.mutate(
        { nombre: values.nombre, ubigeo: values.ubigeo, direccion: values.direccion, activo: values.activo ?? true },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      crear.mutate(
        { nombre: values.nombre, ubigeo: values.ubigeo, direccion: values.direccion },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  const activo = watch("activo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar centro de salud" : "Nuevo centro de salud"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register("nombre")} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ubigeo">Ubigeo</Label>
            <Input id="ubigeo" {...register("ubigeo")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" {...register("direccion")} />
          </div>
          {esEdicion && (
            <div className="flex items-center gap-2 pt-1">
              <input
                id="activo"
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={activo ?? true}
                onChange={(e) => setValue("activo", e.target.checked)}
              />
              <Label htmlFor="activo" className="cursor-pointer font-normal">
                Centro activo
              </Label>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending}>
              {esEdicion ? "Guardar cambios" : "Crear centro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
