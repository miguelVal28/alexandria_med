import "server-only";
import {
  createTriageAiPort,
  type AiTriageRequest,
  type ConversationTurn,
} from "@/lib/integrations/triage-ai";
import {
  createTriageCaseAsSystem,
  appendInteractionAsSystem,
  recordAiAssessmentAsSystem,
  transitionToPendingReviewAsSystem,
  loadInteractionsAsSystem,
} from "./triage.repository";
import { formatDuration, type TriageSubmitInput } from "./triage.schema";

// Multi-turn triage. The case lives in 'submitted' while patient+AI exchange
// clarifying turns; the case transitions to 'pending_medic_assessment' the
// moment the AI signals needsFollowup=false OR the patient force-submits.
//
// Each AI call writes one ai_triage_assessments row (iteration N). The first
// is `initial`, intermediate ones are `follow_up`, and the one that closes
// the loop is `final`.
//
// PHI rule: the AI port receives only the conversation transcript + symptoms
// + duration. Patient identifiers (name, DOB, document, phone) never cross
// the boundary. sanitized_input on the assessment is the audit proof.

export async function submitInitialTriage(
  input: TriageSubmitInput,
  context: { patientId: string; channel: "web" | "whatsapp" },
): Promise<{ caseId: string; needsFollowup: boolean; followupQuestion: string | null }> {
  const summary = buildSummary(input);
  const durationText = formatDuration(input.duration);

  const caseId = await createTriageCaseAsSystem({
    patientId: context.patientId,
    summary,
    symptoms: input.symptoms,
    durationText,
    sourceChannel: context.channel,
  });

  // Patient's first turn = the description from the initial form.
  const firstTurnId = await appendInteractionAsSystem({
    triageCaseId: caseId,
    turnNumber: 1,
    actor: "patient",
    content: input.description,
  });

  // AI iteration 1.
  const conversation: ConversationTurn[] = [
    { actor: "patient", content: input.description },
  ];
  const aiRequest: AiTriageRequest = {
    triageCaseId: caseId,
    iterationNumber: 1,
    symptoms: input.symptoms,
    durationText,
    conversation,
  };
  const ai = createTriageAiPort();
  const aiResponse = await ai.assess(aiRequest);

  await recordAiAssessmentAsSystem({
    triageCaseId: caseId,
    iterationNumber: 1,
    basedOnInteractionId: firstTurnId,
    sanitizedInput: aiRequest as unknown as Record<string, unknown>,
    rawOutput: aiResponse as unknown as Record<string, unknown>,
    suggestedPriority: aiResponse.suggestedPriority,
    n8nExecutionId: aiResponse.n8nExecutionId,
    modelVersion: aiResponse.modelVersion,
    assessmentKind: aiResponse.needsFollowup ? "initial" : "final",
  });

  if (aiResponse.needsFollowup && aiResponse.followupQuestion) {
    // Append AI follow-up question as turn 2; keep status 'submitted'.
    await appendInteractionAsSystem({
      triageCaseId: caseId,
      turnNumber: 2,
      actor: "ai",
      content: aiResponse.followupQuestion,
    });
    return {
      caseId,
      needsFollowup: true,
      followupQuestion: aiResponse.followupQuestion,
    };
  }

  // AI is confident already → close the loop and hand to the medic.
  await transitionToPendingReviewAsSystem(caseId);
  return { caseId, needsFollowup: false, followupQuestion: null };
}

export async function continueTriageConversation(input: {
  caseId: string;
  symptoms: string[];
  durationText: string;
  patientAnswer: string;
}): Promise<{ needsFollowup: boolean; followupQuestion: string | null }> {
  const existing = await loadInteractionsAsSystem(input.caseId);
  const nextTurnNumber = (existing[existing.length - 1]?.turn_number ?? 0) + 1;

  // Append the patient's answer.
  const patientTurnId = await appendInteractionAsSystem({
    triageCaseId: input.caseId,
    turnNumber: nextTurnNumber,
    actor: "patient",
    content: input.patientAnswer,
  });

  // Build the conversation we send to the AI — patient + ai turns only,
  // clinician notes are excluded so the AI never sees internal annotations.
  const allTurns = [
    ...existing.map((t) => ({
      actor: t.actor as "patient" | "ai" | "clinician",
      content: t.content,
    })),
    { actor: "patient" as const, content: input.patientAnswer },
  ];
  const conversation: ConversationTurn[] = allTurns
    .filter((t) => t.actor === "patient" || t.actor === "ai")
    .map((t) => ({ actor: t.actor as "patient" | "ai", content: t.content }));

  // Count prior AI assessments — iteration_number must be unique per case.
  const priorAiTurns = existing.filter((t) => t.actor === "ai").length;
  const iterationNumber = priorAiTurns + 1;

  const aiRequest: AiTriageRequest = {
    triageCaseId: input.caseId,
    iterationNumber,
    symptoms: input.symptoms,
    durationText: input.durationText,
    conversation,
  };
  const ai = createTriageAiPort();
  const aiResponse = await ai.assess(aiRequest);

  await recordAiAssessmentAsSystem({
    triageCaseId: input.caseId,
    iterationNumber,
    basedOnInteractionId: patientTurnId,
    sanitizedInput: aiRequest as unknown as Record<string, unknown>,
    rawOutput: aiResponse as unknown as Record<string, unknown>,
    suggestedPriority: aiResponse.suggestedPriority,
    n8nExecutionId: aiResponse.n8nExecutionId,
    modelVersion: aiResponse.modelVersion,
    assessmentKind: aiResponse.needsFollowup ? "follow_up" : "final",
  });

  if (aiResponse.needsFollowup && aiResponse.followupQuestion) {
    await appendInteractionAsSystem({
      triageCaseId: input.caseId,
      turnNumber: nextTurnNumber + 1,
      actor: "ai",
      content: aiResponse.followupQuestion,
    });
    return {
      needsFollowup: true,
      followupQuestion: aiResponse.followupQuestion,
    };
  }

  await transitionToPendingReviewAsSystem(input.caseId);
  return { needsFollowup: false, followupQuestion: null };
}

export async function forceSubmitForReview(caseId: string): Promise<void> {
  await transitionToPendingReviewAsSystem(caseId);
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