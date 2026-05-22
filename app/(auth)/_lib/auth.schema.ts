import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  full_name: z.string().min(2, "Nombre requerido"),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD"),
  document_type: z.enum(["CC", "CE", "TI", "PA", "RC"]),
  document: z.string().min(4, "Documento requerido"),
  phone: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;
