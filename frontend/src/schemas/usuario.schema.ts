import { z } from "zod";

const ROLES = ["ADMIN", "MEDICO", "ENFERMERA", "OBSTETRA", "SUPERVISOR"] as const;

export const usuarioFormSchema = z.object({
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos").optional(),
  apPaterno: z.string().min(1, "Obligatorio").max(60),
  apMaterno: z.string().min(1, "Obligatorio").max(60),
  nombres: z.string().min(1, "Obligatorio").max(80),
  colegiatura: z.string().max(20).optional().or(z.literal("")),
  titulo: z.string().max(20).optional().or(z.literal("")),
  rol: z.enum(ROLES),
  email: z.string().email("Correo inválido").max(120).optional().or(z.literal("")),
  telefono: z.string().max(15).optional().or(z.literal("")),
  password: z.string().min(8, "Mínimo 8 caracteres").optional().or(z.literal("")),
  centroId: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().optional()
  ),
});

export type UsuarioFormValues = z.infer<typeof usuarioFormSchema>;
