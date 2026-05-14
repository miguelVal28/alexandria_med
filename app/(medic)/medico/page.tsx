import {
  CalendarClock,
  MessageSquareDot,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { KpiTile } from "./_components/KpiTile";
import { PriorityPill } from "./_components/PriorityPill";
import { todaysAppointments } from "@/lib/mock-data/appointments";
import { triageCases } from "@/lib/mock-data/triage-cases";

export default function MedicDashboardPage() {
  const priorityRank: Record<"ALTA" | "MEDIA" | "BAJA", number> = {
    ALTA: 0,
    MEDIA: 1,
    BAJA: 2,
  };
  const queue = [...triageCases]
    .sort((a, b) => {
      const r = priorityRank[a.priority] - priorityRank[b.priority];
      return r !== 0 ? r : a.waitMinutes - b.waitMinutes;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Dashboard
          </p>
          <h1 className="font-display text-2xl text-ink mt-1">
            Buen día, Dra. Restrepo.
          </h1>
        </div>
        <p className="text-xs text-muted font-numeric">
          mié 13 may 2026 · 09:12
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile
          label="Citas hoy"
          value={todaysAppointments.length}
          delta="+2 vs. ayer"
          Icon={CalendarClock}
        />
        <KpiTile
          label="En triage"
          value={triageCases.length}
          delta={`${triageCases.filter((c) => c.priority === "ALTA").length} ALTA`}
          Icon={Stethoscope}
          emphasis
        />
        <KpiTile
          label="Mensajes"
          value={7}
          delta="3 sin leer"
          Icon={MessageSquareDot}
        />
        <KpiTile
          label="Pacientes activos"
          value={184}
          delta="+12 este mes"
          Icon={UsersRound}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <article className="lg:col-span-3 border border-border-default rounded-md bg-surface">
          <header className="px-4 py-3 border-b border-border-default flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Agenda de hoy</h2>
            <Link
              href="/medico/agenda"
              className="text-[11px] text-accent hover:underline"
            >
              ver semana →
            </Link>
          </header>
          <ul className="divide-y divide-border-default text-sm">
            {todaysAppointments.slice(0, 8).map((a) => (
              <li
                key={a.time}
                className="px-4 py-2 flex items-center gap-4 hover:bg-canvas/40"
              >
                <span className="font-numeric text-muted w-14">{a.time}</span>
                <span className="text-ink flex-1 truncate">{a.patient}</span>
                <span className="text-muted text-xs truncate max-w-[40%]">
                  {a.reason}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="lg:col-span-2 border border-border-default rounded-md bg-surface">
          <header className="px-4 py-3 border-b border-border-default flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">
              Cola de triage
            </h2>
            <Link
              href="/medico/triage"
              className="text-[11px] text-accent hover:underline"
            >
              ver todos →
            </Link>
          </header>
          <ul className="divide-y divide-border-default text-sm">
            {queue.map((c) => (
              <li key={c.id} className="px-4 py-2.5 hover:bg-canvas/40">
                <div className="flex items-center justify-between gap-3">
                  <PriorityPill priority={c.priority} />
                  <span className="font-numeric text-[11px] text-muted">
                    {c.waitMinutes}m
                  </span>
                </div>
                <p className="mt-1.5 text-ink leading-tight truncate">
                  {c.patient}
                </p>
                <p className="text-xs text-muted truncate">{c.summary}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
