import { z } from "zod";

export const paiSchema = z.object({
  pacienteId: z.number().positive("Selecciona un paciente"),
  vacunaId: z.number().positive("Selecciona una vacuna"),
  numDosis: z.preprocess(
    (v) => (v === "" || v === undefined || v === null || Number.isNaN(v) ? undefined : Number(v)),
    z.number({ required_error: "Obligatorio" }).int().min(1)
  ),
  fechaAplicacion: z.string().min(1, "Obligatorio"),
  lote: z.string().max(50).optional().or(z.literal("")),
  tipoAplicacion: z.enum(["REGULAR", "BARRIDO"]),
  observaciones: z.string().optional().or(z.literal("")),
});

export type PaiFormValues = z.infer<typeof paiSchema>;
