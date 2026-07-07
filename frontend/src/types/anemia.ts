import type { PacienteResumen } from "@/types/paciente";
import type { ProfesionalResumen } from "@/types/profesional";
import type { UsuarioResumen } from "@/types/usuario";

export type DxAnemia = "LEVE" | "MODERADA" | "SEVERA";
export type TipoHierro = "SULFATO_FERROSO" | "HIERRO_POLIMALTOSADO" | "OTRO";
export type EstadoAnemia = "EN_TRATAMIENTO" | "RECUPERADO" | "ABANDONO" | "TRASLADADO";

export interface ControlEnfermeria {
  registradoPor: UsuarioResumen | null;
  fecha: string | null;
  hbObservado: number | null;
  hbCorregido: number | null;
}

export interface ControlMedico {
  registradoPor: UsuarioResumen | null;
  fecha: string | null;
  observaciones: string | null;
}

export interface Anemia {
  id: number;
  paciente: PacienteResumen;
  registradoPor: UsuarioResumen;
  profesional: ProfesionalResumen | null;
  fechaInicio: string;
  hbInicialObs: number | null;
  hbInicialCorr: number | null;
  dxInicial: DxAnemia;
  tipoHierro: TipoHierro | null;
  dosisIndicada: string | null;
  control1Enfermeria: ControlEnfermeria;
  control1Medico: ControlMedico;
  control2Enfermeria: ControlEnfermeria;
  control2Medico: ControlMedico;
  control3Enfermeria: ControlEnfermeria;
  estado: EstadoAnemia;
  observaciones: string | null;
  esHistorico: boolean;
  createdAt: string;
}

export interface CreateAnemiaInput {
  pacienteId: number;
  fechaInicio: string;
  hbInicialObs?: number;
  dxInicial: DxAnemia;
  tipoHierro?: TipoHierro;
  dosisIndicada?: string;
}

export interface UpdateAnemiaInput {
  fechaInicio: string;
  hbInicialObs?: number;
  dxInicial: DxAnemia;
  tipoHierro?: TipoHierro;
  dosisIndicada?: string;
  estado: EstadoAnemia;
  observaciones?: string;
}
