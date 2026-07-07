export type ProgramaClave = "cred" | "pai" | "tamizaje" | "anemia" | "gestacional";

export interface SerieMensualPunto {
  mes: string;
  valor: number;
}

export interface DistribucionItem {
  categoria: string;
  valor: number;
}

export interface Indicador {
  nombre: string;
  meta: number;
  real: number;
}

export interface ProgramaDashboard {
  totalActivos: number;
  esteMes: number;
  mesAnterior: number;
  tendenciaPct: number;
  serieMensual: SerieMensualPunto[];
  distribucion: DistribucionItem[];
  indicadores: Indicador[];
}
