// DTOs at the WhatsApp boundary. Inbound is what a webhook normalises into;
// outbound is what we send back to the patient. PHI policy:
//   - inbound.body MAY contain PHI (patient describing symptoms); we treat
//     it like any other clinical input and store it under RLS.
//   - outbound MUST NOT contain medical information. Only template references
//     and platform pointers ("ingresa a Alexandria para ver detalles").

export type InboundWhatsAppMessage = {
  providerMessageId: string;
  fromPhoneE164: string;
  body: string;
  receivedAt: string; // ISO timestamp
};

export type OutboundWhatsAppMessage = {
  toPhoneE164: string;
  kind: "triage_prompt" | "scheduling_confirmation" | "system";
  body: string; // template-safe text — no PHI
};