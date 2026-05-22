import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export type TriageCaseRow =
  Database["public"]["Tables"]["triage_cases"]["Row"];
export type AiAssessmentRow =
  Database["public"]["Tables"]["ai_triage_assessments"]["Row"];
export type InteractionRow =
  Database["public"]["Tables"]["triage_interactions"]["Row"];
export type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

export type CaseDetail = {
  triageCase: TriageCaseRow;
  patient: PatientRow | null;
  interactions: InteractionRow[];
  latestAssessment: AiAssessmentRow | null;
};

export async function loadCaseDetail(caseId: string): Promise<CaseDetail | null> {
  const supabase = createClient();

  const { data: triageCase, error: caseErr } = await supabase
    .from("triage_cases")
    .select("*")
    .eq("id", caseId)
    .maybeSingle();
  if (caseErr) throw caseErr;
  if (!triageCase) return null;

  const [patientRes, interactionsRes, assessmentsRes] = await Promise.all([
    supabase
      .from("patients")
      .select("*")
      .eq("id", triageCase.patient_id)
      .maybeSingle(),
    supabase
      .from("triage_interactions")
      .select("*")
      .eq("triage_case_id", caseId)
      .order("turn_number", { ascending: true }),
    supabase
      .from("ai_triage_assessments")
      .select("*")
      .eq("triage_case_id", caseId)
      .order("iteration_number", { ascending: false }),
  ]);

  if (patientRes.error) throw patientRes.error;
  if (interactionsRes.error) throw interactionsRes.error;
  if (assessmentsRes.error) throw assessmentsRes.error;

  return {
    triageCase,
    patient: patientRes.data,
    interactions: interactionsRes.data ?? [],
    latestAssessment: assessmentsRes.data?.[0] ?? null,
  };
}

// Service-role writes. The FSM trigger on triage_cases.status will reject
// anything that violates the allowed graph or the "approved needs reviewed
// assessment" gate.

export async function applyReviewAsSystem(input: {
  caseId: string;
  assessmentId: string;
  clinicianId: string;
  finalPriority: number;
  clinicianDecision: "accepted" | "overridden";
  newStatus: "approved" | "escalated";
}): Promise<void> {
  const admin = createAdminClient();

  // 1. Mark the assessment reviewed.
  const { error: assessErr } = await admin
    .from("ai_triage_assessments")
    .update({
      reviewed_at: new Date().toISOString(),
      clinician_id: input.clinicianId,
      clinician_decision: input.clinicianDecision,
    })
    .eq("id", input.assessmentId);
  if (assessErr) throw assessErr;

  // 2. Set the clinician-final priority on the case.
  const { error: priErr } = await admin
    .from("triage_cases")
    .update({ priority: input.finalPriority })
    .eq("id", input.caseId);
  if (priErr) throw priErr;

  // 3. FSM transition. The DB trigger enforces the allowed graph + the
  //    "approved requires accepted/overridden assessment" extra gate.
  const { error: statusErr } = await admin
    .from("triage_cases")
    .update({ status: input.newStatus })
    .eq("id", input.caseId);
  if (statusErr) throw statusErr;
}