import "server-only";
import type { ITriageEngine } from "./port";
import type { AiTriageRequest, AiTriageResponse } from "./types";

// In-process triage engine. Two roles:
//   1. Primary when N8N is not configured (offline demo).
//   2. Fallback target of CircuitBreakerTriageEngine when N8N is failing.
//
// Multi-turn behavior:
//   - Iteration 1 (after the patient's initial description): pick a rough
//     priority, ask one clarifying question scoped to that priority.
//   - Iteration 2+: finalize using the combined conversation.
//
// Priority scale per Resolución 5596 MinSalud:
//   1 = emergency, 2 = delicate, 3 = urgent non-vital, 4-5 = routine.

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

function followupQuestionFor(priority: number): string {
  if (priority <= 2) {
    return "Para confirmar la urgencia: ¿tienes alguna condición médica previa relevante (enfermedad cardíaca, diabetes, hipertensión, anticoagulantes)? ¿Estás teniendo dificultad para respirar o pérdida de consciencia?";
  }
  if (priority === 3) {
    return "¿Has tomado algún medicamento para estos síntomas en las últimas horas? ¿Has notado algún otro síntoma adicional (fiebre, vómito, mareo)?";
  }
  return "¿Has tenido estos síntomas antes? ¿Hay algo específico que parezca empeorarlos o mejorarlos?";
}

function buildHaystack(req: AiTriageRequest): string {
  const initialFromConversation =
    req.conversation.find((t) => t.actor === "patient")?.content ?? "";
  const allPatientText = req.conversation
    .filter((t) => t.actor === "patient")
    .map((t) => t.content)
    .join(" ");
  return [
    ...req.symptoms,
    req.durationText,
    initialFromConversation,
    allPatientText,
  ].join(" ");
}

export class StubTriageEngine implements ITriageEngine {
  async assess(req: AiTriageRequest): Promise<AiTriageResponse> {
    const haystack = buildHaystack(req);
    const priority = pickPriority(haystack);

    if (req.iterationNumber === 1) {
      return {
        suggestedPriority: priority,
        modelVersion: "stub-v1",
        n8nExecutionId: `stub-${crypto.randomUUID()}`,
        needsFollowup: true,
        followupQuestion: followupQuestionFor(priority),
        reasoning:
          "Análisis inicial basado en reglas — solicito información adicional.",
      };
    }

    return {
      suggestedPriority: priority,
      modelVersion: "stub-v1",
      n8nExecutionId: `stub-${crypto.randomUUID()}`,
      needsFollowup: false,
      followupQuestion: null,
      reasoning:
        "Evaluación final del stub: prioridad consolidada con la información adicional del paciente.",
    };
  }
}

// Back-compat factory.
/** @deprecated instantiate StubTriageEngine directly */
export function createStubAdapter(): ITriageEngine {
  return new StubTriageEngine();
}