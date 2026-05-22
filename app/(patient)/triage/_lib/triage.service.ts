import "server-only";
import { createTriageAiPort, type AiTriageRequest } from "@/lib/integrations/triage-ai";
import {
  createTriageCaseAsSystem,
  appendInteractionAsSystem,
  recordAiAssessmentAsSystem,
  transitionToPendingReviewAsSystem,
} from "./triage.repository";
import { formatDuration, type TriageSubmitInput } from "./triage.schema";

// Channel-agnostic submission. The caller (web action or WhatsApp webhook)
// must verify that patientId matches the requesting actor before invoking
// this service. The service trusts that pre-condition and orchestrates the
// rest:
//  1. Create case in the requested channel.
//  2. First patient turn into triage_interactions.
//  3. Call the AI port with a PHI-free payload (no name/DOB/document/phone).
//  4. Store the assessment — sanitized_input is the audit-proof of what we sent.
//  5. Transition the case to pending_medic_assessment.
//
// FSM enforcement at the DB rejects any caller that tries to skip steps.
export async function submitTriage(
  input: TriageSubmitInput,
  context: { patientId: string; channel: "web" | "whatsapp" },
): Promise<string> {
  const summary = buildSummary(input);
  const durationText = formatDuration(input.duration);

  const caseId = await createTriageCaseAsSystem({
    patientId: context.patientId,
    summary,
    symptoms: input.symptoms,
    durationText,
    sourceChannel: context.channel,
  });

  const interactionId = await appendInteractionAsSystem({
    triageCaseId: caseId,
    turnNumber: 1,
    actor: "patient",
    content: input.description,
  });

  const aiRequest: AiTriageRequest = {
    triageCaseId: caseId,
    iterationNumber: 1,
    symptoms: input.symptoms,
    durationText,
    description: input.description,
  };
  const ai = createTriageAiPort();
  const aiResponse = await ai.assess(aiRequest);

  await recordAiAssessmentAsSystem({
    triageCaseId: caseId,
    iterationNumber: 1,
    basedOnInteractionId: interactionId,
    sanitizedInput: aiRequest as unknown as Record<string, unknown>,
    rawOutput: aiResponse as unknown as Record<string, unknown>,
    suggestedPriority: aiResponse.suggestedPriority,
    n8nExecutionId: aiResponse.n8nExecutionId,
    modelVersion: aiResponse.modelVersion,
  });

  await transitionToPendingReviewAsSystem(caseId);

  return caseId;
}

function buildSummary(input: TriageSubmitInput): string {
  const firstLine = input.description
    .split("\n")
    .map((s) => s.trim())
    .find((s) => s.length > 0);
  if (firstLine && firstLine.length > 0) {
    return firstLine.length > 200 ? firstLine.slice(0, 197) + "…" : firstLine;
  }
  return input.symptoms.slice(0, 5).join(", ");
}