import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Appointment, AppointmentStatus } from "@/lib/mock-data/appointments";
import { cn } from "@/lib/utils";

const statusTone: Record<
  AppointmentStatus,
  "ok" | "warn" | "neutral" | "accent"
> = {
  Confirmada: "ok",
  Pendiente: "warn",
  Realizada: "neutral",
};

const formatLongDate = (iso: string) => {
  const d = new Date(iso + "T00:00");
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export function AppointmentTimeline({
  items,
  dimmed = false,
}: {
  items: Appointment[];
  dimmed?: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="text-muted italic">No hay citas en esta sección.</p>
    );
  }

  return (
    <ol className="relative pl-8">
      <span className="absolute left-2 top-2 bottom-2 w-px bg-border-default" />
      {items.map((a) => (
        <li key={a.id} className="relative pb-8 last:pb-0">
          <span
            className={cn(
              "absolute -left-[1.575rem] top-2 h-3 w-3 rounded-full border-2 border-canvas",
              dimmed ? "bg-muted" : "bg-accent"
            )}
          />
          <article
            className={cn(
              "rounded-themed border bg-surface p-5 transition-opacity",
              dimmed ? "border-border-default opacity-70" : "border-border-default"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl text-ink leading-tight">
                  {a.doctor}
                </p>
                <p className="text-sm text-muted">{a.specialty}</p>
              </div>
              <Badge tone={statusTone[a.status]}>{a.status}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-2 text-ink">
                <CalendarDays className="h-4 w-4 text-muted" />
                {formatLongDate(a.date)} · {a.time}
              </span>
              <span className="inline-flex items-center gap-2 text-muted">
                <MapPin className="h-4 w-4" />
                {a.location}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted italic">{a.reason}</p>
          </article>
        </li>
      ))}
    </ol>
  );
}