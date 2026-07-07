import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCentros } from "@/hooks/useCentro";
import { useActualizarUsuario, useCrearUsuario } from "@/hooks/useUsuario";
import { ROLES_ASIGNABLES } from "@/lib/rol";
import { usuarioFormSchema, type UsuarioFormValues } from "@/schemas/usuario.schema";
import type { Usuario } from "@/types/usuario";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: Usuario | null;
}

const VALORES_VACIOS: UsuarioFormValues = {
  dni: "",
  apPaterno: "",
  apMaterno: "",
  nombres: "",
  colegiatura: "",
  titulo: "",
  rol: "ENFERMERA",
  email: "",
  telefono: "",
  password: "",
};

export function UsuarioFormDialog({ open, onOpenChange, registro }: Props) {
  const esEdicion = !!registro;
  const crear = useCrearUsuario();
  const actualizar = useActualizarUsuario(registro?.id ?? 0);
  const { data: centros } = useCentros();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UsuarioFormValues>({ resolver: zodResolver(usuarioFormSchema), defaultValues: VALORES_VACIOS });

  useEffect(() => {
    if (!open) return;
    if (registro) {
      reset({
        apPaterno: registro.apPaterno,
        apMaterno: registro.apMaterno,
        nombres: registro.nombres,
        colegiatura: registro.colegiatura ?? "",
        titulo: registro.titulo ?? "",
        rol: registro.rol === "SISTEMA" ? "ADMIN" : registro.rol,
        email: registro.email ?? "",
        telefono: "",
        centroId: registro.centroId ?? undefined,
      });
    } else {
      reset(VALORES_VACIOS);
    }
  }, [open, registro, reset]);

  const onSubmit = (values: UsuarioFormValues) => {
    if (esEdicion) {
      actualizar.mutate(
        {
          apPaterno: values.apPaterno,
          apMaterno: values.apMaterno,
          nombres: values.nombres,
          colegiatura: values.colegiatura,
          titulo: values.titulo,
          rol: values.rol,
          email: values.email,
          telefono: values.telefono,
          centroId: values.centroId,
        },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      if (!values.dni || !values.password) return;
      crear.mutate(
        {
          dni: values.dni,
          apPaterno: values.apPaterno,
          apMaterno: values.apMaterno,
          nombres: values.nombres,
          colegiatura: values.colegiatura,
          titulo: values.titulo,
          rol: values.rol,
          email: values.email,
          telefono: values.telefono,
          password: values.password,
          centroId: values.centroId,
        },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  const rol = watch("rol");
  const centroId = watch("centroId");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            {!esEdicion && (
              <div className="space-y-1.5">
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
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={rol} onValueChange={(v) => setValue("rol", v as UsuarioFormValues["rol"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES_ASIGNABLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="space-y-1.5">
              <Label htmlFor="colegiatura">Colegiatura</Label>
              <Input id="colegiatura" {...register("colegiatura")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" placeholder="Ej: Lic., Dr., Obst." {...register("titulo")} />
            </div>
            {!esEdicion && (
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending}>
              {esEdicion ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
