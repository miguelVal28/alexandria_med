import "server-only";
import { composeTriageFacade } from "@/lib/triage/composition";
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

const facade = composeTriageFacade();

// Multi-turn aware orchestration. Uses the same TriageFacade as the web
// channel — only the input adapter (this webhook) differs. That is the
// Facade's reason for existing per ADR-001.
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
    const result = await facade.continueConversation({
      caseId: openCase.id,
      symptoms: openCase.symptoms,
      durationText: openCase.duration_text ?? "",
      patientAnswer: payload.body,
    });
    triageCaseId = openCase.id;
    needsFollowup = result.needsFollowup;
    followupQuestion = result.followupQuestion;
  } else {
    const result = await facade.submitInitial(
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