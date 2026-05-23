import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];

// ─── Patient-scoped reads (RLS filters automatically by patient_id = auth.uid()) ───

export type PatientAppointment = AppointmentRow & {
  medic: { full_name: string; specialty: string | null } | null;
  site: { name: string; address: string } | null;
  triage_case: { id: string; summary: string } | null;
};

export const listAppointmentsForPatient = cache(
  async (): Promise<PatientAppointment[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        medic:medics ( full_name, specialty ),
        site:sites ( name, address ),
        triage_case:triage_cases ( id, summary )
      `,
      )
      .order("scheduled_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as PatientAppointment[];
  },
);

// ─── Booking-form helpers ───
// The medic list is loaded with the admin client because RLS on the medics
// table only allows patients to see medics they're already linked to. For
// booking we deliberately surface all medics; this server-side function
// returns just the safe columns (no document, no license).

export const listMedicsForBooking = cache(
  async (): Promise<Array<{ id: string; full_name: string; specialty: string | null }>> => {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("medics")
      .select("id, full_name, specialty")
      .order("full_name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
);

export const listSitesForBooking = cache(
  async (): Promise<Array<{ id: string; name: string; address: string }>> => {
    // Sites RLS already allows any authenticated user to SELECT.
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sites")
      .select("id, name, address")
      .order("name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
);

// Prefill data when the booking page is opened from an approved triage case.
// Patient sees own triage_case (RLS); patient sees the assigned medic via the
// patient_linked_to_medic() helper which checks triage_cases (link exists).
export type BookingPrefill = {
  triageCaseId: string;
  medicId: string;
  medicName: string;
  medicSpecialty: string | null;
  reason: string;
};

export async function loadBookingPrefill(
  triageCaseId: string,
): Promise<BookingPrefill | null> {
  const supabase = createClient();

  const { data: triageCase, error: caseErr } = await supabase
    .from("triage_cases")
    .select("id, assigned_medic_id, summary, status")
    .eq("id", triageCaseId)
    .maybeSingle();
  if (caseErr) throw caseErr;
  if (!triageCase) return null;
  if (triageCase.status !== "approved") return null;
  if (!triageCase.assigned_medic_id) return null;

  const { data: medic, error: medicErr } = await supabase
    .from("medics")
    .select("id, full_name, specialty")
    .eq("id", triageCase.assigned_medic_id)
    .maybeSingle();
  if (medicErr) throw medicErr;
  if (!medic) return null;

  return {
    triageCaseId: triageCase.id,
    medicId: medic.id,
    medicName: medic.full_name,
    medicSpecialty: medic.specialty,
    reason: `Seguimiento de triaje: ${triageCase.summary}`,
  };
}

// ─── System-scoped write (admin client; RLS denies INSERT for authenticated) ───

export async function createAppointmentAsSystem(input: {
  patientId: string;
  medicId: string;
  siteId: string;
  scheduledAtIso: string;
  reason: string;
  sourceChannel: "web" | "whatsapp";
  triageCaseId?: string | null;
}): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("appointments")
    .insert({
      patient_id: input.patientId,
      medic_id: input.medicId,
      site_id: input.siteId,
      scheduled_at: input.scheduledAtIso,
      reason: input.reason,
      source_channel: input.sourceChannel,
      triage_case_id: input.triageCaseId ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}