// import "server-only";
import type { ITriageEngine } from "./port";
import type { AiTriageRequest, AiTriageResponse } from "./types";

type SanitizedRequest = {
  triage_case_id: string;
  iteration_number: number;
  symptoms: string[];
  duration_text: string;
  conversation: Array<{ actor: "patient" | "system"; content: string }>;
  n8n_execution_id: string | null;
};

// Driven adapter that turns the ITriageEngine port into HTTP calls to the
// teammate's N8N webhook. Implements ADR-002 (Adapter GoF / hexagonal driven
// adapter) and ADR-004 (PHI stripping as a private method of the adapter,
// not as a separate Proxy/Decorator — keeps the audit point local).
export class N8nTriageEngineAdapter implements ITriageEngine {
  constructor(private readonly webhookUrl: string) { }

  async assess(req: AiTriageRequest): Promise<AiTriageResponse> {
    const sanitized = this.phiStripping(req);

    const res = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(sanitized),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      throw new Error(`N8N triage webhook returned HTTP ${res.status}`);
    }

    const text = await res.text();
    let json: Record<string, any>;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error(`N8N no devolvió un JSON válido. Recibido: "${text.slice(0, 100)}..."`);
    }

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
        typeof json.n8n_execution_id === "string" &&
          json.n8n_execution_id.length > 0
          ? json.n8n_execution_id
          : `n8n-${crypto.randomUUID()}`,
      needsFollowup,
      followupQuestion,
      reasoning:
        typeof json.reasoning === "string" ? json.reasoning : undefined,
    };
  }

  // Anticorruption boundary. Builds the outbound payload from a whitelist
  // of safe fields. Patient identifiers (name, DOB, document, phone) live in
  // separate tables and are never read here; this method also asserts that
  // nothing snuck into the request object outside the whitelist.
  private phiStripping(input: AiTriageRequest): SanitizedRequest {
    const sanitized: SanitizedRequest = {
      triage_case_id: input.triageCaseId,
      iteration_number: input.iterationNumber,
      symptoms: input.symptoms,
      duration_text: input.durationText,
      conversation: input.conversation.map((t) => ({
        actor: t.actor === "patient" ? "patient" : "system",
        content: t.content,
      })),
      n8n_execution_id: null,
    };

    // Defensive check: if a future caller adds a field to AiTriageRequest,
    // this loop catches it before it crosses the network.
    const extraKeys = Object.keys(input).filter(
      (k) =>
        ![
          "triageCaseId",
          "iterationNumber",
          "symptoms",
          "durationText",
          "conversation",
        ].includes(k),
    );

    if (extraKeys.length > 0) {
      throw new Error(
        `N8nTriageEngineAdapter.phiStripping refused unknown fields: ${extraKeys.join(
          ", ",
        )}. Update the whitelist deliberately if these are PHI-safe.`,
      );
    }

    return sanitized;
  }
}

// Back-compat factory for the previous (functional) API.
/** @deprecated instantiate N8nTriageEngineAdapter directly */
export function createN8nAdapter(webhookUrl: string): ITriageEngine {
  return new N8nTriageEngineAdapter(webhookUrl);
}