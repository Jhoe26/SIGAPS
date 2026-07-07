import type { Rol } from "@/types/usuario";

export const ROL_LABEL: Record<Rol, string> = {
  ADMIN: "Administrador",
  MEDICO: "Médico",
  ENFERMERA: "Enfermera",
  OBSTETRA: "Obstetra",
  SUPERVISOR: "Supervisor",
  SISTEMA: "Sistema",
};

export const ROL_BADGE_CLASS: Record<Rol, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  MEDICO: "bg-blue-100 text-blue-700 border-blue-200",
  ENFERMERA: "bg-emerald-100 text-emerald-700 border-emerald-200",
  OBSTETRA: "bg-teal-100 text-teal-700 border-teal-200",
  SUPERVISOR: "bg-amber-100 text-amber-700 border-amber-200",
  SISTEMA: "bg-secondary text-muted-foreground border-border",
};

export const ROLES_ASIGNABLES: { value: Rol; label: string }[] = [
  { value: "ADMIN", label: "Administrador" },
  { value: "MEDICO", label: "Médico" },
  { value: "ENFERMERA", label: "Enfermera" },
  { value: "OBSTETRA", label: "Obstetra" },
  { value: "SUPERVISOR", label: "Supervisor" },
];
