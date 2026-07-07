import { z } from "zod";

const numeroOpcional = z.preprocess(
  (v) => (v === "" || v === undefined || v === null || Number.isNaN(v) ? undefined : Number(v)),
  z.number().optional()
);

export const credMenor5Schema = z.object({
  pacienteId: z.number().positive("Selecciona un paciente"),
  fecha: z.string().min(1, "Obligatorio"),
  edadPuntual: z.string().max(20).optional().or(z.literal("")),
  numControl: numeroOpcional,
  peso: numeroOpcional,
  talla: numeroOpcional,
  perimetroCefalico: numeroOpcional,
  dxNutricional: z.enum([
    "GANANCIA_INADECUADA",
    "RECUPERADO",
    "SOBREPESO",
    "DESNUTRICION_AGUDA",
    "DESNUTRICION_CRONICA",
    "NORMAL",
  ]),
  lactanciaHasta6m: z.boolean().optional(),
  gradoRiesgo: z.string().max(50).optional().or(z.literal("")),
  observaciones: z.string().optional().or(z.literal("")),
});

export type CredMenor5FormValues = z.infer<typeof credMenor5Schema>;

export const credMayor5Schema = z.object({
  pacienteId: z.number().positive("Selecciona un paciente"),
  fecha: z.string().min(1, "Obligatorio"),
  edadPuntual: z.string().max(20).optional().or(z.literal("")),
  numControl: numeroOpcional,
  peso: z.preprocess(
    (v) => (v === "" || v === undefined || v === null || Number.isNaN(v) ? undefined : Number(v)),
    z.number({ required_error: "El peso es obligatorio" })
  ),
  talla: z.preprocess(
    (v) => (v === "" || v === undefined || v === null || Number.isNaN(v) ? undefined : Number(v)),
    z.number({ required_error: "La talla es obligatoria (en metros)" })
  ),
  riesgoNutricional: z.enum(["BAJO", "MEDIO", "ALTO"]).optional(),
  dxNutricional: z.enum(["DESNUTRICION_CRONICA", "SOBREPESO", "OBESO", "NORMAL", "RECUPERADO"]),
  observaciones: z.string().optional().or(z.literal("")),
});

export type CredMayor5FormValues = z.infer<typeof credMayor5Schema>;
