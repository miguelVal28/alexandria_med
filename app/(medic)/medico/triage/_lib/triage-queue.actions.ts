"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal/auth";
import { claimCaseAsSystem } from "./triage-queue.repository";

export async function claimCaseAction(formData: FormData) {
  const caseId = String(formData.get("caseId") ?? "");
  if (!caseId) return;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await claimCaseAsSystem(caseId, user.id);
  revalidatePath("/medico/triage");
  redirect(`/medico/triage/${caseId}`);
}