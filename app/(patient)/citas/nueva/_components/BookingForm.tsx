"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  bookAppointmentAction,
  type BookAppointmentState,
} from "../../_lib/appointments.actions";
import type { BookingPrefill } from "../../_lib/appointments.repository";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Agendando…" : label}
    </Button>
  );
}

export function BookingForm({
  medics,
  sites,
  prefill,
}: {
  medics: Array<{ id: string; full_name: string; specialty: string | null }>;
  sites: Array<{ id: string; name: string; address: string }>;
  prefill: BookingPrefill | null;
}) {
  const [state, action] = useFormState<BookAppointmentState, FormData>(
    bookAppointmentAction,
    null,
  );

  // Default the picker to "tomorrow at 09:00" Bogota local.
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateTime = `${tomorrow.toISOString().slice(0, 10)}T09:00`;

  return (
    <form action={action} className="space-y-4">
      {prefill && (
        <input
          type="hidden"
          name="triage_case_id"
          value={prefill.triageCaseId}
        />
      )}

      {state?.ok === false && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      {prefill && (
        <div className="rounded-themed border border-accent/30 bg-accent-soft/40 px-3 py-2 text-xs text-ink">
          Esta cita se vinculará al caso de triaje{" "}
          <span className="font-numeric">
            {prefill.triageCaseId.slice(0, 8)}
          </span>
          .
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="medic_id" className="text-sm">
          Médico
        </label>
        <select
          id="medic_id"
          name="medic_id"
          required
          defaultValue={prefill?.medicId ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="" disabled>
            Selecciona…
          </option>
          {medics.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
              {m.specialty ? ` · ${m.specialty}` : ""}
            </option>
          ))}
        </select>
        {prefill && (
          <p className="text-xs text-muted">
            Profesional que aprobó tu caso: {prefill.medicName}
            {prefill.medicSpecialty ? ` (${prefill.medicSpecialty})` : ""}.
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="site_id" className="text-sm">
          Sede
        </label>
        <select
          id="site_id"
          name="site_id"
          required
          defaultValue=""
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="" disabled>
            Selecciona…
          </option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.address}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="scheduled_at_local" className="text-sm">
          Fecha y hora
        </label>
        <Input
          id="scheduled_at_local"
          name="scheduled_at_local"
          type="datetime-local"
          required
          defaultValue={defaultDateTime}
        />
        <p className="text-xs text-muted">Hora local (America/Bogota).</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="reason" className="text-sm">
          Motivo de la consulta
        </label>
        <Textarea
          id="reason"
          name="reason"
          required
          minLength={5}
          maxLength={500}
          defaultValue={prefill?.reason ?? ""}
          placeholder="Control de presión arterial, dolor recurrente, etc."
          className="min-h-[100px]"
        />
      </div>

      <SubmitButton label={prefill ? "Agendar seguimiento" : "Agendar cita"} />
    </form>
  );
}