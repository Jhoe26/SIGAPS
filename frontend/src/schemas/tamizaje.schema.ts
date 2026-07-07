import { z } from "zod";

export const tamizajeSchema = z.object({
  pacienteId: z.number().positive("Selecciona un paciente"),
  fecha: z.string().min(1, "Obligatorio"),
  grupoEtario: z.string().min(1, "Obligatorio"),
  tipoDosaje: z.enum(["DOSAJE", "SIN_DOSAJE"]),
  hbObservado: z.preprocess(
    (v) => (v === "" || v === undefined || v === null || Number.isNaN(v) ? undefined : Number(v)),
    z.number().min(0, "Debe ser positivo").max(99.99, "Valor fuera de rango").optional()
  ),
  observaciones: z.string().max(1000).optional().or(z.literal("")),
});

export type TamizajeFormValues = z.infer<typeof tamizajeSchema>;
