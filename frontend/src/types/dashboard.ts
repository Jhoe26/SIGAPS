import type { DistribucionItem } from "@/types/programa";

export interface StatCard {
  clave: string;
  label: string;
  valor: number;
  subtexto: string;
  tendenciaPct: number;
}

export interface SerieProgramaPunto {
  mes: string;
  cred: number;
  vacunacion: number;
  anemia: number;
  gestacional: number;
}

export interface CoberturaVacuna {
  vacuna: string;
  meta: number;
  real: number;
}

export interface ActividadReciente {
  usuarioId: number;
  usuarioNombre: string;
  descripcion: string;
  timestamp: string;
}

export interface DashboardResumen {
  statCards: StatCard[];
  atencionesPorPrograma: SerieProgramaPunto[];
  distribucionAnemia: DistribucionItem[];
  coberturaVacunal: CoberturaVacuna[];
  actividadReciente: ActividadReciente[];
}
