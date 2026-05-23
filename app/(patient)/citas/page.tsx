import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listAppointmentsForPatient,
  type PatientAppointment,
} from "./_lib/appointments.repository";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Realizada",
};

const STATUS_TONE: Record<string, string> = {
  pending: "bg-warn/10 text-warn border-warn/30",
  confirmed: "bg-accent-soft text-accent border-accent/30",
  cancelled: "bg-surface text-muted border-border-default",
  completed: "bg-ok/10 text-ok border-ok/30",
};

function formatBogota(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Bogota",
  });
  const time = d.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
  return { date, time };
}

export default async function CitasPage() {
  const all = await listAppointmentsForPatient();
  const nowIso = new Date().toISOString();

  const upcoming = all.filter(
    (a) => a.scheduled_at >= nowIso && a.status !== "completed" && a.status !== "cancelled",
  );
  const past = all.filter(
    (a) => a.scheduled_at < nowIso || a.status === "completed" || a.status === "cancelled",
  );

  return (
    <div className="space-y-12">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">
            Mis citas
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink">
            Tu agenda <span className="italic text-accent">clínica</span>.
          </h1>
        </div>
        <Link
          href="/citas/nueva"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-themed bg-accent text-canvas text-sm font-medium hover:opacity-90 shrink-0"
        >
          <CalendarPlus className="h-4 w-4" />
          Agendar
        </Link>
      </header>

      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-ink">Próximas</h2>
          <span className="text-sm text-muted">
            {upcoming.length} cita{upcoming.length === 1 ? "" : "s"}
          </span>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState text="No tienes citas próximas. Agenda una." />
        ) : (
          <AppointmentList items={upcoming} />
        )}
      </section>

      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-ink">Historial</h2>
          <span className="text-sm text-muted">{past.length} en total</span>
        </div>
        {past.length === 0 ? (
          <EmptyState text="Sin historial todavía." />
        ) : (
          <AppointmentList items={past} dimmed />
        )}
      </section>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-themed border border-dashed border-border-default p-10 text-center text-muted">
      {text}
    </div>
  );
}

function AppointmentList({
  items,
  dimmed,
}: {
  items: PatientAppointment[];
  dimmed?: boolean;
}) {
  return (
    <ol className={`space-y-3 ${dimmed ? "opacity-70" : ""}`}>
      {items.map((a) => {
        const { date, time } = formatBogota(a.scheduled_at);
        const tone = STATUS_TONE[a.status] ?? "";
        const label = STATUS_LABEL[a.status] ?? a.status;
        return (
          <li
            key={a.id}
            className="rounded-themed border border-border-default bg-surface p-5 grid sm:grid-cols-[1fr_auto] gap-3"
          >
            <div className="space-y-1">
              <p className="font-display text-xl text-ink leading-tight">
                {a.medic?.full_name ?? "Médico por confirmar"}
              </p>
              <p className="text-sm text-muted">
                {a.medic?.specialty ?? ""}
              </p>
              <p className="text-sm text-ink mt-1 capitalize">{date}</p>
              <p className="text-sm text-muted font-numeric">
                {time} · {a.site?.name ?? "Sede por definir"}
                {a.room ? ` · ${a.room}` : ""}
              </p>
              {a.reason && (
                <p className="text-sm text-muted mt-1">Motivo: {a.reason}</p>
              )}
            </div>
            <span
              className={`inline-flex h-fit items-center px-2 py-0.5 rounded-full border text-[11px] ${tone}`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}