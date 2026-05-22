import type { AiTriageRequest, AiTriageResponse } from "./types";

// The port. Anything the service depends on for "AI triage" goes here.
// Adapters (N8N, stub, future LLM) implement this interface.
export interface TriageAiPort {
  assess(req: AiTriageRequest): Promise<AiTriageResponse>;
}