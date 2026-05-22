import "server-only";
import { submitTriage } from "@/app/(patient)/triage/_lib/triage.service";
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
  | { status: "ok"; triageCaseId: string }
  | { status: "duplicate"; providerMessageId: string }
  | { status: "patient_not_found"; phoneE164: string };

// Orchestration:
//   1. Idempotency check — if we've seen this provider_message_id before,
//      return early. This is how WhatsApp's at-least-once delivery is tamed.
//   2. Record the raw inbound message (status=received).
//   3. Look up patient by phone. If not found, mark failed and return.
//   4. Submit a triage case via the same service the web flow uses, with
//      channel=whatsapp.
//   5. Link the message to the new case (status=processed).
//   6. Send a NON-PHI outbound confirmation via the WhatsApp port.
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

  const triageCaseId = await submitTriage(
    {
      symptoms: [],
      description: payload.body,
      duration: "hoy",
    },
    { patientId: patient.id, channel: "whatsapp" },
  );

  await linkInboundToTriage({
    providerMessageId: payload.provider_message_id,
    patientId: patient.id,
    triageCaseId,
  });

  // Outbound confirmation — strictly NON-PHI per the spec rule.
  // Real WhatsApp Business API would require pre-approved templates for
  // messages outside the 24h customer-service window; the stub records it
  // verbatim into whatsapp_messages with direction=outbound.
  const outbound = createWhatsAppOutboundPort();
  await outbound.send({
    toPhoneE164: payload.from_phone_e164,
    kind: "scheduling_confirmation",
    body:
      "Recibimos tu reporte. Un profesional lo revisará pronto. Ingresa a Alexandria para ver los detalles.",
  });

  return { status: "ok", triageCaseId };
}