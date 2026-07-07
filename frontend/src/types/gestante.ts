import type { PacienteResumen } from "@/types/paciente";
import type { ProfesionalResumen } from "@/types/profesional";
import type { UsuarioResumen } from "@/types/usuario";

export interface Gestante {
  id: number;
  paciente: PacienteResumen;
  registradoPor: UsuarioResumen;
  profesional: ProfesionalResumen | null;
  telefono: string | null;
  influenzaFecha: string | null;
  dt1Fecha: string | null;
  dt2Fecha: string | null;
  dt3Fecha: string | null;
  hepb1Fecha: string | null;
  hepb2Fecha: string | null;
  hepb3Fecha: string | null;
  tdpaFecha: string | null;
  observaciones: string | null;
  esHistorico: boolean;
  createdAt: string;
}

export interface CreateGestanteInput {
  pacienteId: number;
  telefono?: string;
  influenzaFecha?: string;
  dt1Fecha?: string;
  dt2Fecha?: string;
  dt3Fecha?: string;
  hepb1Fecha?: string;
  hepb2Fecha?: string;
  hepb3Fecha?: string;
  tdpaFecha?: string;
  observaciones?: string;
}

export type UpdateGestanteInput = Omit<CreateGestanteInput, "pacienteId">;
