import "server-only";
import { createAppointmentAsSystem } from "./appointments.repository";
import type { BookAppointmentInput } from "./appointments.schema";

// Domain service for the appointment subsystem. Unlike triage (which has its
// own ADR with explicit GoF patterns), appointments is straight CRUD on top
// of a DB-enforced FSM (the trigger on appointments.status validates every
// transition), so the service is a thin orchestrator.
//
// Timezone policy: the institution operates in America/Bogota (UTC-5). The
// booking form sends a local datetime; this service interprets it as Bogota
// and stores UTC. Centralised here so the rest of the codebase only deals
// with UTC.
export async function bookAppointment(
  input: BookAppointmentInput,
  context: { patientId: string; channel: "web" | "whatsapp" },
): Promise<{ appointmentId: string }> {
  const scheduledAtIso = bogotaLocalToUtcIso(input.scheduled_at_local);

  const appointmentId = await createAppointmentAsSystem({
    patientId: context.patientId,
    medicId: input.medic_id,
    siteId: input.site_id,
    scheduledAtIso,
    reason: input.reason,
    sourceChannel: context.channel,
    triageCaseId: input.triage_case_id ?? null,
  });

  return { appointmentId };
}

// "2026-05-25T14:30" (Bogota) → ISO UTC. JS parses the explicit -05:00 offset
// regardless of the runtime's own timezone, so Vercel (UTC) and local dev
// behave the same.
function bogotaLocalToUtcIso(local: string): string {
  return new Date(`${local}:00-05:00`).toISOString();
}