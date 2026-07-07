import { Activity, Baby, HeartPulse, Syringe, type LucideIcon } from "lucide-react";

import type { ProgramaClave } from "@/types/programa";

export interface ProgramaConfig {
  clave: ProgramaClave;
  titulo: string;
  subtitulo: string;
  icon: LucideIcon;
  gradienteDesde: string;
  gradienteHasta: string;
  color: string;
}

export const PROGRAMAS: Record<ProgramaClave, ProgramaConfig> = {
  cred: {
    clave: "cred",
    titulo: "CRED",
    subtitulo: "Control de Crecimiento y Desarrollo",
    icon: HeartPulse,
    gradienteDesde: "#7C3AED",
    gradienteHasta: "#5B21B6",
    color: "#7C3AED",
  },
  pai: {
    clave: "pai",
    titulo: "Vacunación (PAI)",
    subtitulo: "Programa Ampliado de Inmunizaciones",
    icon: Syringe,
    gradienteDesde: "#047857",
    gradienteHasta: "#065F46",
    color: "#047857",
  },
  tamizaje: {
    clave: "tamizaje",
    titulo: "Tamizaje",
    subtitulo: "Detección temprana y tamizaje neonatal",
    icon: Activity,
    gradienteDesde: "#2563EB",
    gradienteHasta: "#1E40AF",
    color: "#2563EB",
  },
  anemia: {
    clave: "anemia",
    titulo: "Anemia",
    subtitulo: "Control y tratamiento de anemia ferropénica",
    icon: Activity,
    gradienteDesde: "#EA580C",
    gradienteHasta: "#9A3412",
    color: "#EA580C",
  },
  gestacional: {
    clave: "gestacional",
    titulo: "Gestacional",
    subtitulo: "Atención prenatal y control de gestantes",
    icon: Baby,
    gradienteDesde: "#BE123C",
    gradienteHasta: "#881337",
    color: "#BE123C",
  },
};
