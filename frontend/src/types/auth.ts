import type { Rol } from "@/types/usuario";

export interface CentroResumen {
  id: number;
  nombre: string;
}

export interface UsuarioAuth {
  id: number;
  dni: string;
  nombreCompleto: string;
  titulo: string | null;
  colegiatura: string | null;
  email: string | null;
  rol: Rol;
  centro: CentroResumen | null;
}

export interface LoginRequest {
  /** Acepta DNI (8 dígitos) o correo electrónico; el backend resuelve ambos. */
  dni: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UsuarioAuth;
}
