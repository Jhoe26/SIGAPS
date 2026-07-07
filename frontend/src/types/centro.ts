export interface CentroSalud {
  id: number;
  nombre: string;
  ubigeo: string | null;
  direccion: string | null;
  activo: boolean;
}

export interface CreateCentroSaludInput {
  nombre: string;
  ubigeo?: string;
  direccion?: string;
}

export interface UpdateCentroSaludInput {
  nombre: string;
  ubigeo?: string;
  direccion?: string;
  activo: boolean;
}
