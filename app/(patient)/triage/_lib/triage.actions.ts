"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal/auth";
import { triageSubmitSchema } from "./triage.schema";
import { submitTriage } from "./triage.service";

export type TriageActionState =
  | { ok: false; error: string }
  | null;

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

  // Verify the authenticated user before delegating to the service. The
  // service trusts that the patientId it receives has been validated against
  // the requesting actor.
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión inválida" };

  let caseId: string;
  try {
    caseId = await submitTriage(parsed.data, {
      patientId: user.id,
      channel: "web",
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al enviar el reporte",
    };
  }

  revalidatePath("/");
  redirect(`/triage/${caseId}`);
}