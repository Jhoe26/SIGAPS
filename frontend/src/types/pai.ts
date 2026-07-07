import type { PacienteResumen } from "@/types/paciente";
import type { ProfesionalResumen } from "@/types/profesional";
import type { UsuarioResumen } from "@/types/usuario";
import type { VacunaCatalogo } from "@/types/catalogo";

export type TipoAplicacion = "REGULAR" | "BARRIDO";

export type SubmoduloPai = "pai-menor12m" | "pai-12m-5a" | "pai-mayor5a" | "pai-7a-15a";

export const SUBMODULOS_PAI: { value: SubmoduloPai; label: string }[] = [
  { value: "pai-menor12m", label: "Menor de 12 meses" },
  { value: "pai-12m-5a", label: "12 meses a 5 años" },
  { value: "pai-mayor5a", label: "Mayor de 5 años" },
  { value: "pai-7a-15a", label: "7 a 15 años" },
];

export interface Pai {
  id: number;
  paciente: PacienteResumen;
  registradoPor: UsuarioResumen;
  profesional: ProfesionalResumen | null;
  vacuna: VacunaCatalogo | null;
  numDosis: number;
  fechaAplicacion: string;
  lote: string | null;
  tipoAplicacion: TipoAplicacion;
  observaciones: string | null;
  esHistorico: boolean;
  createdAt: string;
}

export interface CreatePaiInput {
  pacienteId: number;
  vacunaId: number;
  numDosis: number;
  fechaAplicacion: string;
  lote?: string;
  tipoAplicacion: TipoAplicacion;
  observaciones?: string;
}

export type UpdatePaiInput = Omit<CreatePaiInput, "pacienteId">;
