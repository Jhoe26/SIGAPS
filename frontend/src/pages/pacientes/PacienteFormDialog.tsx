import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { DateInput } from "@/components/shared/DateInput";
import { DniAutocompleteField } from "@/components/shared/DniAutocompleteField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActualizarPaciente, useCrearPaciente } from "@/hooks/usePaciente";
import { pacienteSchema, type PacienteFormValues } from "@/schemas/paciente.schema";
import type { Acreditado } from "@/types/acreditado";
import type { Paciente } from "@/types/paciente";

interface PacienteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente?: Paciente | null;
  soloLectura?: boolean;
}

const valoresVacios: PacienteFormValues = {
  dni: "",
  apPaterno: "",
  apMaterno: "",
  nombres: "",
  fechaNacimiento: "",
  sexo: "M",
  telefono: "",
  direccion: "",
  distrito: "",
  tipoSeguro: "NINGUNO",
};

export function PacienteFormDialog({ open, onOpenChange, paciente, soloLectura }: PacienteFormDialogProps) {
  const esEdicion = !!paciente;
  const crear = useCrearPaciente();
  const actualizar = useActualizarPaciente(paciente?.id ?? 0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PacienteFormValues>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: valoresVacios,
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    reset(
      paciente
        ? {
            dni: paciente.dni,
            apPaterno: paciente.apPaterno,
            apMaterno: paciente.apMaterno,
            nombres: paciente.nombres,
            fechaNacimiento: paciente.fechaNacimiento,
            sexo: paciente.sexo,
            telefono: paciente.telefono ?? "",
            direccion: paciente.direccion ?? "",
            distrito: paciente.distrito ?? "",
            tipoSeguro: paciente.tipoSeguro,
          }
        : valoresVacios
    );
  }, [open, paciente, reset]);

  const onSubmit = (values: PacienteFormValues) => {
    const mutation = esEdicion ? actualizar : crear;
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) });
  };

  const dniActual = watch("dni");
  const sexoActual = watch("sexo");
  const tipoSeguroActual = watch("tipoSeguro");

  const handleAutocomplete = (datos: Acreditado | null) => {
    if (datos) {
      setValue("apPaterno", datos.apPaterno ?? "", { shouldValidate: true });
      setValue("apMaterno", datos.apMaterno ?? "", { shouldValidate: true });
      setValue("nombres", datos.nombres ?? "", { shouldValidate: true });
      setValue("fechaNacimiento", datos.fechaNacimiento ?? "", { shouldValidate: true });
      setValue("sexo", datos.sexo, { shouldValidate: true });
      setValue("direccion", datos.direccion ?? "");
      setValue("distrito", datos.distrito ?? "");
      setValue("tipoSeguro", "ESSALUD");
    } else {
      setValue("apPaterno", "");
      setValue("apMaterno", "");
      setValue("nombres", "");
      setValue("fechaNacimiento", "");
      setValue("direccion", "");
      setValue("distrito", "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{soloLectura ? "Detalle del paciente" : esEdicion ? "Editar paciente" : "Nuevo paciente"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="dni">DNI</Label>
              <DniAutocompleteField
                value={dniActual}
                onChange={(v) => setValue("dni", v, { shouldValidate: true })}
                onAutocomplete={handleAutocomplete}
                disabled={esEdicion || soloLectura}
                error={errors.dni?.message}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apPaterno">Apellido paterno</Label>
              <Input id="apPaterno" disabled={soloLectura} {...register("apPaterno")} />
              {errors.apPaterno && <p className="text-sm text-destructive">{errors.apPaterno.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apMaterno">Apellido materno</Label>
              <Input id="apMaterno" disabled={soloLectura} {...register("apMaterno")} />
              {errors.apMaterno && <p className="text-sm text-destructive">{errors.apMaterno.message}</p>}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="nombres">Nombres</Label>
              <Input id="nombres" disabled={soloLectura} {...register("nombres")} />
              {errors.nombres && <p className="text-sm text-destructive">{errors.nombres.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
              <DateInput id="fechaNacimiento" disabled={soloLectura} {...register("fechaNacimiento")} />
              {errors.fechaNacimiento && (
                <p className="text-sm text-destructive">{errors.fechaNacimiento.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Sexo</Label>
              <Select
                value={sexoActual}
                onValueChange={(v) => setValue("sexo", v as "M" | "F")}
                disabled={soloLectura}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" disabled={soloLectura} {...register("telefono")} />
            </div>
            <div className="space-y-1.5">
              <Label>Seguro</Label>
              <Select
                value={tipoSeguroActual}
                onValueChange={(v) => setValue("tipoSeguro", v as PacienteFormValues["tipoSeguro"])}
                disabled={soloLectura}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIS">SIS</SelectItem>
                  <SelectItem value="ESSALUD">ESSALUD</SelectItem>
                  <SelectItem value="PRIVADO">Privado</SelectItem>
                  <SelectItem value="NINGUNO">Ninguno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="distrito">Distrito</Label>
              <Input id="distrito" disabled={soloLectura} {...register("distrito")} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" disabled={soloLectura} {...register("direccion")} />
            </div>
          </div>
          <DialogFooter>
            {soloLectura ? (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            ) : (
              <Button type="submit" disabled={crear.isPending || actualizar.isPending}>
                {esEdicion ? "Guardar cambios" : "Registrar paciente"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
