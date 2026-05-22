"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal/auth";
import {
  triageSubmitSchema,
  followupSchema,
  forceSubmitSchema,
  formatDuration,
} from "./triage.schema";
import { composeTriageFacade } from "@/lib/triage/composition";
import { findTriageCaseById } from "./triage.repository";

export type TriageActionState =
  | { ok: false; error: string }
  | null;

const facade = composeTriageFacade();

export async function submitTriageAction(
  _prev: TriageActionState,
  formData: FormData,
): Promise<TriageActionState> {
  const parsed = triageSubmitSchema.safeParse({
    symptoms: formData.getAll("symptoms").map((v) => String(v)),
    description: String(formData.get("description") ?? ""),
    duration: String(formData.get("duration") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión inválida" };

  let caseId: string;
  try {
    const result = await facade.submitInitial(parsed.data, {
      patientId: user.id,
      channel: "web",
    });
    caseId = result.caseId;
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al enviar el reporte",
    };
  }

  revalidatePath("/");
  redirect(`/triage/${caseId}`);
}

export async function continueConversationAction(
  _prev: TriageActionState,
  formData: FormData,
): Promise<TriageActionState> {
  const parsed = followupSchema.safeParse({
    caseId: formData.get("caseId"),
    answer: formData.get("answer"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión inválida" };

  const triageCase = await findTriageCaseById(parsed.data.caseId);
  if (!triageCase) {
    return { ok: false, error: "Caso no encontrado o sin permisos" };
  }
  if (triageCase.status !== "submitted") {
    return {
      ok: false,
      error: "Este caso ya está en revisión por un profesional",
    };
  }

  try {
    await facade.continueConversation({
      caseId: parsed.data.caseId,
      symptoms: triageCase.symptoms,
      durationText: triageCase.duration_text ?? "",
      patientAnswer: parsed.data.answer,
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al continuar la conversación",
    };
  }

  revalidatePath(`/triage/${parsed.data.caseId}`);
  return null;
}

export async function forceSubmitAction(
  _prev: TriageActionState,
  formData: FormData,
): Promise<TriageActionState> {
  const parsed = forceSubmitSchema.safeParse({
    caseId: formData.get("caseId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos" };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión inválida" };

  try {
    await facade.forceSubmitForReview(parsed.data.caseId);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al enviar para revisión",
    };
  }

  revalidatePath(`/triage/${parsed.data.caseId}`);
  return null;
}

export { formatDuration };