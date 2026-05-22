import "server-only";
import type { TriageAiPort } from "./port";
import type { AiTriageRequest, AiTriageResponse } from "./types";

// Adapter: turns the port contract into an HTTP call against the teammate's
// N8N webhook. Contract assumed:
//   Request body  (JSON): { triage_case_id, iteration_number, symptoms[], duration_text, description }
//   Response body (JSON): { suggested_priority, model_version, n8n_execution_id, reasoning? }
// If N8N changes its contract we change this adapter, not the service.
export function createN8nAdapter(webhookUrl: string): TriageAiPort {
  return {
    async assess(req: AiTriageRequest): Promise<AiTriageResponse> {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          triage_case_id: req.triageCaseId,
          iteration_number: req.iterationNumber,
          symptoms: req.symptoms,
          duration_text: req.durationText,
          description: req.description,
        }),
        // 10s ceiling so a hanging N8N doesn't block the user forever.
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        throw new Error(`N8N triage webhook returned HTTP ${res.status}`);
      }

      const json = (await res.json()) as Record<string, unknown>;
      const sp = json.suggested_priority;

      return {
        suggestedPriority:
          typeof sp === "number" && sp >= 1 && sp <= 5 ? Math.round(sp) : null,
        modelVersion:
          typeof json.model_version === "string"
            ? json.model_version
            : "n8n-unknown",
        n8nExecutionId:
          typeof json.n8n_execution_id === "string" && json.n8n_execution_id.length > 0
            ? json.n8n_execution_id
            : `n8n-${crypto.randomUUID()}`,
        reasoning:
          typeof json.reasoning === "string" ? json.reasoning : undefined,
      };
    },
  };
}