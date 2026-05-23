"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal/auth";
import {
  transitionAppointmentAsSystem,
  type AppointmentStatus,
} from "./agenda.repository";

const ALLOWED_TRANSITIONS: AppointmentStatus[] = [
  "confirmed",
  "cancelled",
  "completed",
];

export async function transitionAppointmentAction(formData: FormData) {
  const appointmentId = String(formData.get("appointmentId") ?? "");
  const newStatus = String(formData.get("newStatus") ?? "") as AppointmentStatus;

  if (!appointmentId) return;
  if (!ALLOWED_TRANSITIONS.includes(newStatus)) return;

  const user = await getCurrentUser();
  if (!user) return;

  try {
    await transitionAppointmentAsSystem(appointmentId, newStatus);
  } catch (e) {
    // The FSM trigger rejects illegal transitions with check_violation. We
    // swallow it here for the demo — the page will simply re-render with
    // the unchanged row. Production would surface this via useFormState.
    console.error("appointment transition failed:", e);
  }

  revalidatePath("/medico/agenda");
}