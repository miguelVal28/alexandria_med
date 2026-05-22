import "server-only";
import {
  submitInitialTriage,
  continueTriageConversation,
} from "@/app/(patient)/triage/_lib/triage.service";
import { findActiveCaseForPatientAsSystem } from "@/app/(patient)/triage/_lib/triage.repository";
import { createWhatsAppOutboundPort } from "@/lib/integrations/whatsapp";
import {
  findWhatsAppMessageById,
  recordInboundMessage,
  findPatientByPhone,
  linkInboundToTriage,
  markInboundFailed,
} from "./inbound.repository";
import type { InboundPayload } from "./inbound.schema";

export type InboundResult =
  | { status: "ok"; triageCaseId: string; replied: boolean; reply: string | null }
  | { status: "duplicate"; providerMessageId: string }
  | { status: "patient_not_found"; phoneE164: string };

// Multi-turn aware orchestration:
//   1. Idempotency check.
//   2. Record raw inbound.
//   3. Find patient by phone (else fail).
//   4. If the patient has an OPEN case (status='submitted'), append the
//      message as a follow-up turn and let the AI decide next step.
//      Otherwise, treat as initial triage.
//   5. Link the inbound message to the (new or existing) case.
//   6. Send the AI's follow-up question back via the outbound port (if any).
//      Otherwise send a "your case is under review" confirmation.
export async function processInbound(
  payload: InboundPayload,
): Promise<InboundResult> {
  const receivedAt = payload.received_at ?? new Date().toISOString();

  const existing = await findWhatsAppMessageById(payload.provider_message_id);
  if (existing) {
    return {
      status: "duplicate",
      providerMessageId: payload.provider_message_id,
    };
  }

  await recordInboundMessage({
    providerMessageId: payload.provider_message_id,
    phoneE164: payload.from_phone_e164,
    body: payload.body,
    receivedAt,
  });

  const patient = await findPatientByPhone(payload.from_phone_e164);
  if (!patient) {
    await markInboundFailed({
      providerMessageId: payload.provider_message_id,
      errorMessage: "patient_not_found_for_phone",
    });
    return { status: "patient_not_found", phoneE164: payload.from_phone_e164 };
  }

  const openCase = await findActiveCaseForPatientAsSystem(patient.id);

  let triageCaseId: string;
  let needsFollowup: boolean;
  let followupQuestion: string | null;

  if (openCase) {
    const result = await continueTriageConversation({
      caseId: openCase.id,
      symptoms: openCase.symptoms,
      durationText: openCase.duration_text ?? "",
      patientAnswer: payload.body,
    });
    triageCaseId = openCase.id;
    needsFollowup = result.needsFollowup;
    followupQuestion = result.followupQuestion;
  } else {
    const result = await submitInitialTriage(
      {
        symptoms: [],
        description: payload.body,
        duration: "hoy",
      },
      { patientId: patient.id, channel: "whatsapp" },
    );
    triageCaseId = result.caseId;
    needsFollowup = result.needsFollowup;
    followupQuestion = result.followupQuestion;
  }

  await linkInboundToTriage({
    providerMessageId: payload.provider_message_id,
    patientId: patient.id,
    triageCaseId,
  });

  // Outbound message. The AI's clarifying question is allowed here — it's a
  // generic medical question, not PHI. Once the loop closes, send a non-PHI
  // confirmation pointing back to the platform.
  const outbound = createWhatsAppOutboundPort();
  const reply = needsFollowup
    ? followupQuestion ?? "¿Puedes contarnos un poco más?"
    : "Recibimos toda la información. Un profesional revisará tu caso pronto. Ingresa a Alexandria para ver el estado.";
  await outbound.send({
    toPhoneE164: payload.from_phone_e164,
    kind: needsFollowup ? "triage_prompt" : "scheduling_confirmation",
    body: reply,
  });

  return {
    status: "ok",
    triageCaseId,
    replied: true,
    reply,
  };
}