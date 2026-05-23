"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal/auth";
import { bookAppointmentSchema } from "./appointments.schema";
import { bookAppointment } from "./appointments.service";

export type BookAppointmentState =
  | { ok: false; error: string }
  | null;

export async function bookAppointmentAction(
  _prev: BookAppointmentState,
  formData: FormData,
): Promise<BookAppointmentState> {
  const rawTriageId = formData.get("triage_case_id");
  const parsed = bookAppointmentSchema.safeParse({
    medic_id: formData.get("medic_id"),
    site_id: formData.get("site_id"),
    scheduled_at_local: formData.get("scheduled_at_local"),
    reason: formData.get("reason"),
    triage_case_id:
      typeof rawTriageId === "string" && rawTriageId.length > 0
        ? rawTriageId
        : undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión inválida" };

  try {
    await bookAppointment(parsed.data, {
      patientId: user.id,
      channel: "web",
    });
  } catch (e) {
    // Unique-violation likely means the medic is double-booked.
    const msg = e instanceof Error ? e.message : "Error al agendar la cita";
    if (msg.includes("appointments_no_double_booking")) {
      return {
        ok: false,
        error: "Ese horario ya está ocupado para este médico. Elige otro.",
      };
    }
    return { ok: false, error: msg };
  }

  revalidatePath("/citas");
  redirect("/citas");
}