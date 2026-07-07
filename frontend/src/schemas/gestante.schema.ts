import { z } from "zod";

const fechaOpcional = z.string().optional().or(z.literal(""));

export const gestanteFormSchema = z.object({
  pacienteId: z.number().optional(),
  telefono: z.string().max(20).optional().or(z.literal("")),
  influenzaFecha: fechaOpcional,
  dt1Fecha: fechaOpcional,
  dt2Fecha: fechaOpcional,
  dt3Fecha: fechaOpcional,
  hepb1Fecha: fechaOpcional,
  hepb2Fecha: fechaOpcional,
  hepb3Fecha: fechaOpcional,
  tdpaFecha: fechaOpcional,
  observaciones: z.string().optional().or(z.literal("")),
});

export type GestanteFormValues = z.infer<typeof gestanteFormSchema>;
