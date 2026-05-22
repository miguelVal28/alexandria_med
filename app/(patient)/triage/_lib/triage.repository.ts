import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type TriageCaseRow = Database["public"]["Tables"]["triage_cases"]["Row"];

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

// ─── System-scoped writes (admin client) ───
// Used by both the web action (after the action verifies auth.uid()) and the
// WhatsApp webhook (after it verifies the shared secret + maps phone→patient).
// Each caller is responsible for ensuring patientId matches the requesting
// actor before invoking the service.

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
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("ai_triage_assessments").insert({
    triage_case_id: input.triageCaseId,
    iteration_number: input.iterationNumber,
    assessment_kind: "initial",
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