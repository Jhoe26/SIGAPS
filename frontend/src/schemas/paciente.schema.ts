import { z } from "zod";

export const pacienteSchema = z.object({
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  apPaterno: z.string().min(1, "Obligatorio").max(60),
  apMaterno: z.string().min(1, "Obligatorio").max(60),
  nombres: z.string().min(1, "Obligatorio").max(80),
  fechaNacimiento: z
    .string()
    .min(1, "Obligatorio")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Fecha inválida")
    .refine((v) => new Date(v).getFullYear() >= 1900, "La fecha no puede ser anterior a 1900")
    .refine((v) => new Date(v) <= new Date(), "La fecha no puede ser futura"),
  sexo: z.enum(["M", "F"], { required_error: "Obligatorio" }),
  telefono: z.string().max(15).optional().or(z.literal("")),
  direccion: z.string().max(200).optional().or(z.literal("")),
  distrito: z.string().max(60).optional().or(z.literal("")),
  tipoSeguro: z.enum(["SIS", "ESSALUD", "PRIVADO", "NINGUNO"]).optional(),
});

export type PacienteFormValues = z.infer<typeof pacienteSchema>;
