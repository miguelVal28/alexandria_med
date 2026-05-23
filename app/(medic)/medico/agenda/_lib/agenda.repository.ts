import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentStatus =
  Database["public"]["Enums"]["appointment_status"];

export type MedicAppointment = AppointmentRow & {
  patient: { full_name: string; risk: string } | null;
  site: { name: string } | null;
};

// Patient name is RLS-visible to the medic only when the patient is linked
// (here via the appointment itself, which is the linkage). The Supabase JS
// client honours the patient SELECT policy automatically.
export const listAppointmentsForMedic = cache(
  async (): Promise<MedicAppointment[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        patient:patients ( full_name, risk ),
        site:sites ( name )
      `,
      )
      .order("scheduled_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as MedicAppointment[];
  },
);

// FSM transitions. The DB trigger enforces the allowed graph
// (pending → confirmed/cancelled, confirmed → completed/cancelled, completed = terminal),
// so we just attempt the UPDATE and let the trigger reject illegal moves.
export async function transitionAppointmentAsSystem(
  appointmentId: string,
  newStatus: AppointmentStatus,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("appointments")
    .update({ status: newStatus })
    .eq("id", appointmentId);
  if (error) throw error;
}