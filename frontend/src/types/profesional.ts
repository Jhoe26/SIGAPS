export interface ProfesionalResumen {
  id: number;
  dni: string;
  nombreCompleto: string;
  especialidad: string | null;
  colegiatura: string | null;
}

export interface Profesional {
  id: number;
  dni: string;
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  nombreCompleto: string;
  especialidad: string | null;
  colegiatura: string | null;
  tipoColegio: string | null;
  centroId: number | null;
  activo: boolean;
  totalPacientesAtendidos: number;
  createdAt: string;
}

export interface CreateProfesionalInput {
  dni: string;
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  especialidad?: string;
  colegiatura?: string;
  tipoColegio?: string;
  centroId?: number;
}

export interface UpdateProfesionalInput {
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  especialidad?: string;
  colegiatura?: string;
  tipoColegio?: string;
  centroId?: number;
  activo: boolean;
}
