import "server-only";
import type { TriageAiPort } from "./port";
import { createN8nAdapter } from "./n8n.adapter";
import { createStubAdapter } from "./stub.adapter";

export type { TriageAiPort } from "./port";
export type { AiTriageRequest, AiTriageResponse } from "./types";

// Adapter selection: real N8N if a webhook URL is configured, stub otherwise.
// This is the only place that decides which implementation runs; the service
// only knows the TriageAiPort interface.
export function createTriageAiPort(): TriageAiPort {
  const url = process.env.N8N_TRIAGE_WEBHOOK_URL;
  if (url && url.trim().length > 0) {
    return createN8nAdapter(url);
  }
  return createStubAdapter();
}