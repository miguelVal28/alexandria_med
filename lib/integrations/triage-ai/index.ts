import "server-only";
import type { ITriageEngine } from "./port";
import { N8nTriageEngineAdapter } from "./n8n.adapter";
import { StubTriageEngine } from "./stub.adapter";

// Public exports — the rest of the app should import classes and the port
// from here, not from the individual files. This keeps the integration
// module a single boundary.
export type { ITriageEngine, TriageAiPort } from "./port";
export type {
  AiTriageRequest,
  AiTriageResponse,
  ConversationTurn,
} from "./types";
export { N8nTriageEngineAdapter } from "./n8n.adapter";
export { StubTriageEngine } from "./stub.adapter";
export { CircuitBreakerTriageEngine } from "./circuit-breaker.engine";

// Deprecated functional factory. Prefer composing classes explicitly via the
// composition root in lib/triage/composition.ts.
/** @deprecated compose engines explicitly in lib/triage/composition.ts */
export function createTriageAiPort(): ITriageEngine {
  const url = process.env.N8N_TRIAGE_WEBHOOK_URL;
  if (url && url.trim().length > 0) {
    return new N8nTriageEngineAdapter(url);
  }
  return new StubTriageEngine();
}