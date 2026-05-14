import { WeekCalendar } from "../_components/WeekCalendar";

export default function AgendaPage() {
  return (
    <div className="space-y-5">
      <header className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Agenda
          </p>
          <h1 className="font-display text-2xl text-ink mt-1">
            Semana clínica
          </h1>
        </div>
        <p className="text-xs text-muted font-numeric">
          zona horaria · America/Bogota
        </p>
      </header>
      <WeekCalendar />
    </div>
  );
}
