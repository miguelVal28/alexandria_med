import "server-only";
import { getCurrentUser } from "@/lib/dal/auth";
import { applyReviewAsSystem } from "./triage-review.repository";
import type { ReviewInput } from "./triage-review.schema";

// Decision policy:
//   - If the clinician's priority matches the AI's suggestion, decision = accepted.
//   - If they differ, decision = overridden.
// This is computed in the service from the inputs so the form stays simple.
export async function applyReview(
  input: ReviewInput,
  aiSuggestedPriority: number | null,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sesión inválida");

  const decision: "accepted" | "overridden" =
    aiSuggestedPriority !== null && input.finalPriority === aiSuggestedPriority
      ? "accepted"
      : "overridden";

  await applyReviewAsSystem({
    caseId: input.caseId,
    assessmentId: input.assessmentId,
    clinicianId: user.id,
    finalPriority: input.finalPriority,
    clinicianDecision: decision,
    newStatus: input.outcome,
  });
}