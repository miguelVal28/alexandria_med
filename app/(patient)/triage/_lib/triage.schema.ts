import { z } from "zod";

export const TRIAGE_DURATIONS = ["hoy", "dias", "semana"] as const;
export type TriageDuration = (typeof TRIAGE_DURATIONS)[number];

const DURATION_LABEL: Record<TriageDuration, string> = {
  hoy: "Hoy mismo",
  dias: "Hace 2 o 3 días",
  semana: "Hace más de una semana",
};

export function formatDuration(d: TriageDuration): string {
  return DURATION_LABEL[d];
}

export const triageSubmitSchema = z
  .object({
    symptoms: z.array(z.string().min(1)).max(20),
    description: z
      .string()
      .min(10, "Cuéntanos un poco más sobre cómo te sientes")
      .max(2000, "Máximo 2000 caracteres"),
    duration: z.enum(TRIAGE_DURATIONS),
  })
  .refine((d) => d.symptoms.length > 0 || d.description.trim().length > 0, {
    message: "Selecciona un síntoma o descríbelo con tus palabras",
    path: ["symptoms"],
  });

export type TriageSubmitInput = z.infer<typeof triageSubmitSchema>;