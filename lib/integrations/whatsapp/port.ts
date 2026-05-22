import type { OutboundWhatsAppMessage } from "./types";

// The outbound port. Adapters (real WhatsApp Business API, stub, fake) implement
// this interface. The application code only depends on this.
export interface WhatsAppOutboundPort {
  send(message: OutboundWhatsAppMessage): Promise<{ providerMessageId: string }>;
}