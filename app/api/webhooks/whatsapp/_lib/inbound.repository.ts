import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

// All webhook reads/writes use admin client — there is no Supabase auth
// session inside a webhook handler. The shared-secret check upstream is
// what authorises the call.

export async function findWhatsAppMessageById(providerMessageId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_messages")
    .select("provider_message_id, status, linked_triage_case_id")
    .eq("provider_message_id", providerMessageId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function recordInboundMessage(input: {
  providerMessageId: string;
  phoneE164: string;
  body: string;
  receivedAt: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("whatsapp_messages").insert({
    provider_message_id: input.providerMessageId,
    direction: "inbound",
    phone_e164: input.phoneE164,
    body: input.body,
    kind: "freeform_inbound",
    status: "received",
    received_at: input.receivedAt,
  });
  if (error) throw error;
}

export async function findPatientByPhone(
  phoneE164: string,
): Promise<PatientRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("patients")
    .select("*")
    .eq("phone", phoneE164)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function linkInboundToTriage(input: {
  providerMessageId: string;
  patientId: string;
  triageCaseId: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("whatsapp_messages")
    .update({
      linked_patient_id: input.patientId,
      linked_triage_case_id: input.triageCaseId,
      status: "processed",
      processed_at: new Date().toISOString(),
    })
    .eq("provider_message_id", input.providerMessageId);
  if (error) throw error;
}

export async function markInboundFailed(input: {
  providerMessageId: string;
  errorMessage: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("whatsapp_messages")
    .update({
      status: "failed",
      error_message: input.errorMessage,
      processed_at: new Date().toISOString(),
    })
    .eq("provider_message_id", input.providerMessageId);
  if (error) throw error;
}