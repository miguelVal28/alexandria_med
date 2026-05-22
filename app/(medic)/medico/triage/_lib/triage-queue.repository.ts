import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type QueueRow = {
  id: string;
  summary: string;
  symptoms: string[];
  duration_text: string | null;
  submitted_at: string;
  assigned_medic_id: string | null;
  ai: {
    suggested_priority: number | null;
    iteration_number: number;
    model_version: string;
  } | null;
};

// Lists cases the current medic should see in the queue:
//   - own assigned cases in pending_medic_assessment
//   - unassigned cases in submitted or pending_medic_assessment
// RLS already enforces this; we just filter for display.
export async function listPendingCases(): Promise<QueueRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("triage_cases")
    .select(
      `
      id,
      summary,
      symptoms,
      duration_text,
      submitted_at,
      assigned_medic_id,
      ai_triage_assessments (
        suggested_priority,
        iteration_number,
        model_version
      )
    `,
    )
    // Only show cases that are actually waiting for a medic. Cases in
    // 'submitted' are still in the patient↔AI conversation loop and should
    // not be claimable yet.
    .eq("status", "pending_medic_assessment")
    .order("submitted_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const assessments = row.ai_triage_assessments ?? [];
    const latest = assessments.reduce<typeof assessments[number] | null>(
      (best, curr) =>
        best === null || curr.iteration_number > best.iteration_number
          ? curr
          : best,
      null,
    );
    return {
      id: row.id,
      summary: row.summary,
      symptoms: row.symptoms,
      duration_text: row.duration_text,
      submitted_at: row.submitted_at,
      assigned_medic_id: row.assigned_medic_id,
      ai: latest
        ? {
            suggested_priority: latest.suggested_priority,
            iteration_number: latest.iteration_number,
            model_version: latest.model_version,
          }
        : null,
    };
  });
}

// Service-role: assigns a medic to a case. RLS denies UPDATE on triage_cases
// for authenticated; this is the system-level transition.
export async function claimCaseAsSystem(
  caseId: string,
  medicId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("triage_cases")
    .update({ assigned_medic_id: medicId })
    .eq("id", caseId)
    .is("assigned_medic_id", null);
  if (error) throw error;
}