import { z } from "zod";

export const profesionalFormSchema = z.object({
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos").optional(),
  nombres: z.string().min(1, "Obligatorio").max(80),
  apPaterno: z.string().min(1, "Obligatorio").max(60),
  apMaterno: z.string().min(1, "Obligatorio").max(60),
  especialidad: z.string().max(80).optional().or(z.literal("")),
  colegiatura: z.string().max(20).optional().or(z.literal("")),
  tipoColegio: z.string().max(20).optional().or(z.literal("")),
  centroId: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().optional()
  ),
  activo: z.boolean().optional(),
});

export type ProfesionalFormValues = z.infer<typeof profesionalFormSchema>;
