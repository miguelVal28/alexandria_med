import { z } from "zod";

// Simplified inbound contract for the demo. A real WhatsApp Cloud API webhook
// is significantly more complex; the responsibility of mapping it to this
// shape would live in the adapter (production code), not the service.
export const inboundSchema = z.object({
  provider_message_id: z
    .string()
    .min(1, "provider_message_id requerido"),
  from_phone_e164: z
    .string()
    .regex(/^\+\d{8,15}$/, "Teléfono en formato E.164 (+CCNNNNNNNN…)"),
  body: z.string().min(1, "body requerido").max(2000),
  received_at: z.string().datetime().optional(),
});

export type InboundPayload = z.infer<typeof inboundSchema>;