import "server-only";
import type { WhatsAppOutboundPort } from "./port";
import { createStubWhatsAppAdapter } from "./stub.adapter";

export type { WhatsAppOutboundPort } from "./port";
export type {
  InboundWhatsAppMessage,
  OutboundWhatsAppMessage,
} from "./types";

// Factory. For the MVP we only have the stub (records outbound to the DB).
// A real adapter would be selected here based on env (e.g.,
// WHATSAPP_PROVIDER=cloud_api with WHATSAPP_ACCESS_TOKEN set).
export function createWhatsAppOutboundPort(): WhatsAppOutboundPort {
  return createStubWhatsAppAdapter();
}