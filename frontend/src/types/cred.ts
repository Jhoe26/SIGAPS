import type { PacienteResumen } from "@/types/paciente";
import type { ProfesionalResumen } from "@/types/profesional";
import type { UsuarioResumen } from "@/types/usuario";

export type DxNutricionalMenor5 =
  | "GANANCIA_INADECUADA"
  | "RECUPERADO"
  | "SOBREPESO"
  | "DESNUTRICION_AGUDA"
  | "DESNUTRICION_CRONICA"
  | "NORMAL";

export type DxNutricionalMayor5 = "DESNUTRICION_CRONICA" | "SOBREPESO" | "OBESO" | "NORMAL" | "RECUPERADO";

export type RiesgoNutricional = "BAJO" | "MEDIO" | "ALTO";

export interface CredMenor5 {
  id: number;
  paciente: PacienteResumen;
  registradoPor: UsuarioResumen;
  profesional: ProfesionalResumen | null;
  fecha: string;
  edadPuntual: string | null;
  numControl: number | null;
  peso: number | null;
  talla: number | null;
  perimetroCefalico: number | null;
  dxNutricional: DxNutricionalMenor5;
  lactanciaHasta6m: boolean | null;
  gradoRiesgo: string | null;
  observaciones: string | null;
  esHistorico: boolean;
  createdAt: string;
}

export interface CreateCredMenor5Input {
  pacienteId: number;
  fecha: string;
  edadPuntual?: string;
  numControl?: number;
  peso?: number;
  talla?: number;
  perimetroCefalico?: number;
  dxNutricional: DxNutricionalMenor5;
  lactanciaHasta6m?: boolean;
  gradoRiesgo?: string;
  observaciones?: string;
}

export type UpdateCredMenor5Input = Omit<CreateCredMenor5Input, "pacienteId">;

export interface CredMayor5 {
  id: number;
  paciente: PacienteResumen;
  registradoPor: UsuarioResumen;
  profesional: ProfesionalResumen | null;
  fecha: string;
  edadPuntual: string | null;
  numControl: number | null;
  peso: number | null;
  talla: number | null;
  imc: number | null;
  riesgoNutricional: RiesgoNutricional | null;
  dxNutricional: DxNutricionalMayor5;
  observaciones: string | null;
  esHistorico: boolean;
  createdAt: string;
}

export interface CreateCredMayor5Input {
  pacienteId: number;
  fecha: string;
  edadPuntual?: string;
  numControl?: number;
  peso: number;
  talla: number;
  riesgoNutricional?: RiesgoNutricional;
  dxNutricional: DxNutricionalMayor5;
  observaciones?: string;
}

export type UpdateCredMayor5Input = Omit<CreateCredMayor5Input, "pacienteId">;
