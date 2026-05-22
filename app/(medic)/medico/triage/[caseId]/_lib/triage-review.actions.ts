"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { reviewSchema } from "./triage-review.schema";
import { applyReview } from "./triage-review.service";
import { loadCaseDetail } from "./triage-review.repository";

export type ReviewActionState =
  | { ok: false; error: string }
  | null;

export async function reviewCaseAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const parsed = reviewSchema.safeParse({
    caseId: formData.get("caseId"),
    assessmentId: formData.get("assessmentId"),
    finalPriority: formData.get("finalPriority"),
    outcome: formData.get("outcome"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  // Look up the AI suggestion so the service can compute accepted vs. overridden.
  const detail = await loadCaseDetail(parsed.data.caseId);
  const aiSuggested = detail?.latestAssessment?.suggested_priority ?? null;

  try {
    await applyReview(parsed.data, aiSuggested);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al cerrar el caso",
    };
  }

  revalidatePath("/medico/triage");
  revalidatePath(`/medico/triage/${parsed.data.caseId}`);
  redirect("/medico/triage");
}