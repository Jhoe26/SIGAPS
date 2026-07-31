import type { Sexo } from "./paciente";

export interface Acreditado {
  dni: string;
  apPaterno: string;
  apMaterno: string;
  nombres: string;
  fechaNacimiento: string;
  sexo: Sexo;
  direccion: string | null;
  distrito: string | null;
  parentesco: string | null;
  dniTitular: string | null;
  codigoCas: string | null;
  nombreCas: string | null;
}
