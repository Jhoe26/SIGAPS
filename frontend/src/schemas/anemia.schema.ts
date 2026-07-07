import { z } from "zod";

const numeroOpcional = z.preprocess(
  (v) => (v === "" || v === undefined || v === null || Number.isNaN(v) ? undefined : Number(v)),
  z.number().optional()
);

export const anemiaFormSchema = z.object({
  pacienteId: z.number().optional(),
  fechaInicio: z.string().min(1, "Obligatorio"),
  hbInicialObs: numeroOpcional,
  dxInicial: z.enum(["LEVE", "MODERADA", "SEVERA"]),
  tipoHierro: z.enum(["SULFATO_FERROSO", "HIERRO_POLIMALTOSADO", "OTRO"]).optional(),
  dosisIndicada: z.string().max(100).optional().or(z.literal("")),
  estado: z.enum(["EN_TRATAMIENTO", "RECUPERADO", "ABANDONO", "TRASLADADO"]).optional(),
  observaciones: z.string().optional().or(z.literal("")),
});

export type AnemiaFormValues = z.infer<typeof anemiaFormSchema>;
