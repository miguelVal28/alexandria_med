import { z } from "zod";

// Booking form: datetime-local inputs return "YYYY-MM-DDTHH:MM" with no
// timezone. The service interprets the string as America/Bogota (the
// institution's timezone) and stores UTC in the DB.
export const bookAppointmentSchema = z.object({
  medic_id: z.string().uuid("Selecciona un médico"),
  site_id: z.string().uuid("Selecciona una sede"),
  scheduled_at_local: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Fecha y hora inválidas"),
  reason: z
    .string()
    .min(5, "Cuéntanos brevemente la razón (mínimo 5 caracteres)")
    .max(500, "Máximo 500 caracteres"),
  // Optional: appointment originated from an approved triage case.
  triage_case_id: z.string().uuid().optional(),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
