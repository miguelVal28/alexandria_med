import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WhatsAppOutboundPort } from "./port";
import type { OutboundWhatsAppMessage } from "./types";

// Stub adapter: records the outbound message into whatsapp_messages instead
// of calling a real WhatsApp Business API. The architectural intent is the
// same as in production — the service depends on the port, not on this
// implementation. Swap to a real adapter (WhatsApp Cloud API, Twilio, etc.)
// without touching the service.
export function createStubWhatsAppAdapter(): WhatsAppOutboundPort {
  return {
    async send(message: OutboundWhatsAppMessage) {
      const admin = createAdminClient();
      const providerMessageId = `stub-out-${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      const { error } = await admin.from("whatsapp_messages").insert({
        provider_message_id: providerMessageId,
        direction: "outbound",
        phone_e164: message.toPhoneE164,
        body: message.body,
        kind: message.kind,
        status: "sent",
        sent_at: now,
      });
      if (error) throw error;

      return { providerMessageId };
    },
  };
}