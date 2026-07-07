import type { PacienteResumen } from "@/types/paciente";
import type { ProfesionalResumen } from "@/types/profesional";
import type { UsuarioResumen } from "@/types/usuario";

export type TipoDosaje = "DOSAJE" | "SIN_DOSAJE";

export const GRUPOS_ETARIOS_TAMIZAJE = [
  { value: "MENOR_6M", label: "Menor de 6 meses" },
  { value: "6_11M", label: "6 a 11 meses" },
  { value: "12M_23M", label: "12 a 23 meses" },
  { value: "2A", label: "2 años" },
  { value: "3A", label: "3 años" },
  { value: "4A", label: "4 años" },
  { value: "5A_MAS", label: "5 años a más" },
] as const;

export interface TamizajeHb {
  id: number;
  paciente: PacienteResumen;
  registradoPor: UsuarioResumen;
  profesional: ProfesionalResumen | null;
  fecha: string;
  edadAnios: number | null;
  edadMeses: number | null;
  edadDias: number | null;
  grupoEtario: string;
  tipoDosaje: TipoDosaje;
  hbObservado: number | null;
  hbCorregido: number | null;
  observaciones: string | null;
  esHistorico: boolean;
  createdAt: string;
}

export interface CreateTamizajeInput {
  pacienteId: number;
  profesionalId?: number;
  fecha: string;
  grupoEtario: string;
  tipoDosaje: TipoDosaje;
  hbObservado?: number;
  observaciones?: string;
}

export type UpdateTamizajeInput = Omit<CreateTamizajeInput, "pacienteId">;
