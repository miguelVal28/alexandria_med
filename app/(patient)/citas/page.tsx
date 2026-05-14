import { AppointmentTimeline } from "../_components/AppointmentTimeline";
import { appointments } from "@/lib/mock-data/appointments";

const today = "2026-05-13";

export default function CitasPage() {
  const upcoming = appointments
    .filter((a) => a.date >= today && a.status !== "Realizada")
    .sort((a, b) => a.date.localeCompare(b.date));

  const past = appointments
    .filter((a) => a.date < today || a.status === "Realizada")
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">
          Mis citas
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink">
          Tu agenda <span className="italic text-accent">clínica</span>.
        </h1>
      </header>

      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-ink">Próximas</h2>
          <span className="text-sm text-muted">
            {upcoming.length} cita{upcoming.length === 1 ? "" : "s"}
          </span>
        </div>
        <AppointmentTimeline items={upcoming} />
      </section>

      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-ink">Historial</h2>
          <span className="text-sm text-muted">{past.length} en total</span>
        </div>
        <AppointmentTimeline items={past} dimmed />
      </section>
    </div>
  );
}