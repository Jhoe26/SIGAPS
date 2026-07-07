export type Rol = "ENFERMERA" | "MEDICO" | "ADMIN" | "SISTEMA" | "SUPERVISOR" | "OBSTETRA";

export interface UsuarioResumen {
  id: number;
  dni: string;
  nombreCompleto: string;
  titulo: string | null;
  colegiatura: string | null;
}

export interface Usuario {
  id: number;
  dni: string;
  apPaterno: string;
  apMaterno: string;
  nombres: string;
  nombreCompleto: string;
  colegiatura: string | null;
  titulo: string | null;
  rol: Rol;
  email: string | null;
  telefono: string | null;
  activo: boolean;
  esSistema: boolean;
  centroId: number | null;
  ultimoAcceso: string | null;
  createdAt: string;
}

export interface CreateUsuarioInput {
  dni: string;
  apPaterno: string;
  apMaterno: string;
  nombres: string;
  colegiatura?: string;
  titulo?: string;
  rol: Rol;
  email?: string;
  telefono?: string;
  password: string;
  centroId?: number;
}

export type UpdateUsuarioInput = Omit<CreateUsuarioInput, "dni" | "password">;

export interface UsuarioStats {
  administradores: number;
  medicos: number;
  enfermerasObstetras: number;
  supervisores: number;
}
