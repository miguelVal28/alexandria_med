import "server-only";
import type { TriageAiPort } from "./port";
import type { AiTriageRequest, AiTriageResponse } from "./types";

// Fallback adapter when N8N_TRIAGE_WEBHOOK_URL is not configured (or N8N is
// down). Rule-based classifier — not clinically meaningful, just enough to
// drive the demo flow when the teammate's N8N isn't reachable.
//
// Priority scale (Resolución 5596 MinSalud):
//   1 = emergency        — immediate risk
//   2 = delicate         — urgent, time-bound
//   3 = urgent not life-threatening
//   4-5 = routine

const PRIORITY_1_KEYWORDS = [
  "torácico",
  "torax",
  "infarto",
  "desorientación",
  "desorientacion",
  "marcha inestable",
  "sangrado",
  "convulsión",
  "convulsion",
  "inconsciente",
];

const PRIORITY_2_KEYWORDS = [
  "disnea",
  "falta de aire",
  "palpitaciones",
  "dolor abdominal severo",
  "fiebre alta",
];

const PRIORITY_3_KEYWORDS = [
  "fiebre",
  "vómito",
  "vomito",
  "náuseas",
  "nauseas",
  "dolor abdominal",
  "cefalea",
  "dolor de cabeza",
];

function pickPriority(haystack: string): number {
  const h = haystack.toLowerCase();
  if (PRIORITY_1_KEYWORDS.some((k) => h.includes(k))) return 1;
  if (PRIORITY_2_KEYWORDS.some((k) => h.includes(k))) return 2;
  if (PRIORITY_3_KEYWORDS.some((k) => h.includes(k))) return 3;
  return 4;
}

export function createStubAdapter(): TriageAiPort {
  return {
    async assess(req: AiTriageRequest): Promise<AiTriageResponse> {
      const haystack = [
        ...req.symptoms,
        req.description,
        req.durationText,
      ].join(" ");
      const priority = pickPriority(haystack);

      return {
        suggestedPriority: priority,
        modelVersion: "stub-v1",
        n8nExecutionId: `stub-${crypto.randomUUID()}`,
        reasoning:
          "Clasificación basada en reglas locales (stub — N8N no configurado).",
      };
    },
  };
}