import { z } from "zod";

export const centroFormSchema = z.object({
  nombre: z.string().min(1, "Obligatorio").max(150),
  ubigeo: z.string().max(10).optional().or(z.literal("")),
  direccion: z.string().max(200).optional().or(z.literal("")),
  activo: z.boolean().optional(),
});

export type CentroFormValues = z.infer<typeof centroFormSchema>;
