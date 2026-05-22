import { z } from "zod";

export const TRIAGE_OUTCOMES = ["approved", "escalated"] as const;
export type TriageOutcome = (typeof TRIAGE_OUTCOMES)[number];

export const reviewSchema = z.object({
  caseId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  finalPriority: z.coerce.number().int().min(1).max(5),
  outcome: z.enum(TRIAGE_OUTCOMES),
});

export type ReviewInput = z.infer<typeof reviewSchema>;