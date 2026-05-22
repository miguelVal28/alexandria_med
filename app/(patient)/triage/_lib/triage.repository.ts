import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type TriageCaseRow = Database["public"]["Tables"]["triage_cases"]["Row"];
type InteractionRow = Database["public"]["Tables"]["triage_interactions"]["Row"];

// ─── Patient-scoped reads (RLS enforces patient_id = auth.uid()) ───

export async function findTriageCaseById(
  id: string,
): Promise<TriageCaseRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("triage_cases")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function loadCaseWithInteractions(id: string): Promise<{
  triageCase: TriageCaseRow;
  interactions: InteractionRow[];
} | null> {
  const supabase = createClient();
  const { data: triageCase, error: caseErr } = await supabase
    .from("triage_cases")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (caseErr) throw caseErr;
  if (!triageCase) return null;

  const { data: interactions, error: turnsErr } = await supabase
    .from("triage_interactions")
    .select("*")
    .eq("triage_case_id", id)
    .order("turn_number", { ascending: true });
  if (turnsErr) throw turnsErr;

  return {
    triageCase,
    interactions: interactions ?? [],
  };
}

// ─── System-scoped writes (admin client) ───

export async function createTriageCaseAsSystem(input: {
  patientId: string;
  summary: string;
  symptoms: string[];
  durationText: string;
  sourceChannel: "web" | "whatsapp";
}): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("triage_cases")
    .insert({
      patient_id: input.patientId,
      summary: input.summary,
      symptoms: input.symptoms,
      duration_text: input.durationText,
      source_channel: input.sourceChannel,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function appendInteractionAsSystem(input: {
  triageCaseId: string;
  turnNumber: number;
  actor: "patient" | "ai" | "clinician";
  content: string;
}): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("triage_interactions")
    .insert({
      triage_case_id: input.triageCaseId,
      turn_number: input.turnNumber,
      actor: input.actor,
      content: input.content,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function recordAiAssessmentAsSystem(input: {
  triageCaseId: string;
  iterationNumber: number;
  basedOnInteractionId: string;
  sanitizedInput: Record<string, unknown>;
  rawOutput: Record<string, unknown>;
  suggestedPriority: number | null;
  n8nExecutionId: string;
  modelVersion: string;
  assessmentKind: "initial" | "follow_up" | "final";
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("ai_triage_assessments").insert({
    triage_case_id: input.triageCaseId,
    iteration_number: input.iterationNumber,
    assessment_kind: input.assessmentKind,
    n8n_execution_id: input.n8nExecutionId,
    model_version: input.modelVersion,
    based_on_interaction_id: input.basedOnInteractionId,
    sanitized_input: input.sanitizedInput as never,
    raw_output: input.rawOutput as never,
    suggested_priority: input.suggestedPriority,
  });
  if (error) throw error;
}

export async function transitionToPendingReviewAsSystem(
  triageCaseId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("triage_cases")
    .update({ status: "pending_medic_assessment" })
    .eq("id", triageCaseId);
  if (error) throw error;
}

export async function loadInteractionsAsSystem(
  triageCaseId: string,
): Promise<InteractionRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("triage_interactions")
    .select("*")
    .eq("triage_case_id", triageCaseId)
    .order("turn_number", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function findActiveCaseForPatientAsSystem(
  patientId: string,
): Promise<TriageCaseRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("triage_cases")
    .select("*")
    .eq("patient_id", patientId)
    .in("status", ["submitted"])
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}