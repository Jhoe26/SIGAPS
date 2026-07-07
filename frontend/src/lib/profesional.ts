const TITULOS_POR_COLEGIO: Record<string, string> = {
  CMP: "Dr./Dra.",
  CEP: "Enf.",
  COP: "Obst.",
  CNP: "Nut.",
};

export function tituloPorColegio(tipoColegio: string | null): string {
  if (!tipoColegio) return "";
  return TITULOS_POR_COLEGIO[tipoColegio.toUpperCase()] ?? "";
}

export const TIPOS_COLEGIO = [
  { value: "CMP", label: "CMP — Colegio Médico" },
  { value: "CEP", label: "CEP — Colegio de Enfermeros" },
  { value: "COP", label: "COP — Colegio de Obstetras" },
  { value: "CNP", label: "CNP — Colegio de Nutricionistas" },
];
