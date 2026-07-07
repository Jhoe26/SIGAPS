import type { ProgramaConfig } from "@/lib/programas";
import { AnemiaPacientesSection } from "@/pages/programas/pacientes/AnemiaPacientesSection";
import { CredPacientesSection } from "@/pages/programas/pacientes/CredPacientesSection";
import { GestacionalPacientesSection } from "@/pages/programas/pacientes/GestacionalPacientesSection";
import { PaiPacientesSection } from "@/pages/programas/pacientes/PaiPacientesSection";
import { TamizajePacientesSection } from "@/pages/programas/pacientes/TamizajePacientesSection";

interface TabProps {
  config: ProgramaConfig;
  senalNuevoRegistro: number;
}

export function PacientesTab({ config, senalNuevoRegistro }: TabProps) {
  switch (config.clave) {
    case "cred":
      return <CredPacientesSection senalNuevoRegistro={senalNuevoRegistro} />;
    case "pai":
      return <PaiPacientesSection senalNuevoRegistro={senalNuevoRegistro} />;
    case "tamizaje":
      return <TamizajePacientesSection senalNuevoRegistro={senalNuevoRegistro} />;
    case "anemia":
      return <AnemiaPacientesSection senalNuevoRegistro={senalNuevoRegistro} />;
    case "gestacional":
      return <GestacionalPacientesSection senalNuevoRegistro={senalNuevoRegistro} />;
    default:
      return null;
  }
}
