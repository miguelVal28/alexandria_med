import "server-only";
import type { TriageAiPort } from "./port";
import type { AiTriageRequest, AiTriageResponse } from "./types";

// Adapter: turns the port contract into an HTTP call against the teammate's
// N8N webhook. Contract assumed:
//   Request body  (JSON): {
//     triage_case_id, iteration_number, symptoms[], duration_text,
//     conversation: [{actor, content}, ...]
//   }
//   Response body (JSON): {
//     suggested_priority, model_version, n8n_execution_id,
//     needs_followup, followup_question?, reasoning?
//   }
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
          conversation: req.conversation,
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        throw new Error(`N8N triage webhook returned HTTP ${res.status}`);
      }

      const json = (await res.json()) as Record<string, unknown>;
      const sp = json.suggested_priority;
      const needsFollowup = json.needs_followup === true;
      const rawFollowup = json.followup_question;
      const followupQuestion =
        needsFollowup && typeof rawFollowup === "string" && rawFollowup.length > 0
          ? rawFollowup
          : null;

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
        needsFollowup,
        followupQuestion,
        reasoning:
          typeof json.reasoning === "string" ? json.reasoning : undefined,
      };
    },
  };
}