export type Sexo = "M" | "F";
export type TipoSeguro = "SIS" | "ESSALUD" | "PRIVADO" | "NINGUNO";

export interface PacienteResumen {
  id: number;
  dni: string;
  nombreCompleto: string;
  fechaNacimiento: string;
}

export interface Paciente {
  id: number;
  dni: string;
  apPaterno: string;
  apMaterno: string;
  nombres: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  edadAnios: number;
  edadMeses: number;
  edadDias: number;
  sexo: Sexo;
  telefono: string | null;
  direccion: string | null;
  distrito: string | null;
  tipoSeguro: TipoSeguro;
  esHistorico: boolean;
  activo: boolean;
  createdAt: string;
}

export interface CreatePacienteInput {
  dni: string;
  apPaterno: string;
  apMaterno: string;
  nombres: string;
  fechaNacimiento: string;
  sexo: Sexo;
  telefono?: string;
  direccion?: string;
  distrito?: string;
  tipoSeguro?: TipoSeguro;
}

export type UpdatePacienteInput = CreatePacienteInput;
