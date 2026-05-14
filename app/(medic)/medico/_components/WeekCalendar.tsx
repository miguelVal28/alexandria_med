"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "Confirmada" | "Pendiente" | "Realizada";

type Block = {
  id: string;
  day: number; // 0..6 (Mon..Sun)
  start: number; // hour 7..18
  duration: number; // hours
  patient: string;
  status: Status;
};

const HOUR_START = 7;
const HOUR_END = 19; // exclusive
const HOURS = Array.from(
  { length: HOUR_END - HOUR_START },
  (_, i) => HOUR_START + i
);

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Mock blocks for the visible week. Times are 0-indexed hour-of-day.
const BLOCKS: Block[] = [
  { id: "b1", day: 0, start: 7, duration: 1, patient: "R. Castaño", status: "Confirmada" },
  { id: "b2", day: 0, start: 9, duration: 1, patient: "E. Vélez", status: "Confirmada" },
  { id: "b3", day: 0, start: 11, duration: 1, patient: "V. Ruiz", status: "Pendiente" },
  { id: "b4", day: 0, start: 14, duration: 1, patient: "C. Arboleda", status: "Confirmada" },
  { id: "b5", day: 0, start: 16, duration: 1, patient: "M. Salazar", status: "Pendiente" },
  { id: "b6", day: 1, start: 8, duration: 2, patient: "Bloque quirófano", status: "Confirmada" },
  { id: "b7", day: 1, start: 11, duration: 1, patient: "D. Quintero", status: "Confirmada" },
  { id: "b8", day: 1, start: 15, duration: 1, patient: "I. Tobón", status: "Pendiente" },
  { id: "b9", day: 2, start: 7, duration: 1, patient: "F. Cárdenas", status: "Confirmada" },
  { id: "b10", day: 2, start: 9, duration: 1, patient: "A. Pérez", status: "Realizada" },
  { id: "b11", day: 2, start: 10, duration: 1, patient: "L. Estrada", status: "Realizada" },
  { id: "b12", day: 2, start: 13, duration: 2, patient: "Junta clínica", status: "Confirmada" },
  { id: "b13", day: 2, start: 16, duration: 1, patient: "S. Lopera", status: "Pendiente" },
  { id: "b14", day: 3, start: 8, duration: 1, patient: "T. Aristizábal", status: "Confirmada" },
  { id: "b15", day: 3, start: 9, duration: 1, patient: "M. Jaramillo", status: "Confirmada" },
  { id: "b16", day: 3, start: 11, duration: 1, patient: "S. Ramírez", status: "Pendiente" },
  { id: "b17", day: 3, start: 14, duration: 2, patient: "Telemedicina", status: "Confirmada" },
  { id: "b18", day: 4, start: 7, duration: 1, patient: "L. Bustamante", status: "Confirmada" },
  { id: "b19", day: 4, start: 9, duration: 1, patient: "M. Hincapié", status: "Confirmada" },
  { id: "b20", day: 4, start: 11, duration: 1, patient: "L. Posada", status: "Pendiente" },
  { id: "b21", day: 4, start: 14, duration: 1, patient: "A. Betancur", status: "Confirmada" },
  { id: "b22", day: 4, start: 16, duration: 2, patient: "Comité calidad", status: "Confirmada" },
  { id: "b23", day: 5, start: 8, duration: 1, patient: "P. Cano", status: "Pendiente" },
  { id: "b24", day: 5, start: 10, duration: 1, patient: "G. Restrepo", status: "Confirmada" },
];

const baseMonday = new Date("2026-05-11T00:00");

const statusStyle: Record<Status, string> = {
  Confirmada: "bg-accent-soft border-accent/40 text-ink",
  Pendiente:
    "bg-transparent border-dashed border-accent/70 text-accent",
  Realizada:
    "bg-surface border-border-default text-muted",
};

function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

function formatDayLong(d: Date) {
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRange(start: Date, end: Date) {
  const s = start.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  const e = end.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${s} – ${e}`;
}

export function WeekCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(2); // Wed = "today" in our mock

  const monday = useMemo(
    () => addDays(baseMonday, weekOffset * 7),
    [weekOffset]
  );
  const sunday = useMemo(() => addDays(monday, 6), [monday]);

  const dayBlocks = (d: number) =>
    BLOCKS.filter((b) => b.day === d).sort((a, b) => a.start - b.start);

  const selectedDayBlocks = dayBlocks(selectedDay);
  const counts = useMemo(() => {
    const c = { Confirmada: 0, Pendiente: 0, Realizada: 0 } as Record<Status, number>;
    selectedDayBlocks.forEach((b) => (c[b.status] += 1));
    return c;
  }, [selectedDayBlocks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
      <div className="space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekOffset((w) => w - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekOffset((w) => w + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm text-ink font-numeric ml-1">
              {formatRange(monday, sunday)}
            </span>
          </div>
          {weekOffset !== 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset(0)}
            >
              Hoy
            </Button>
          )}
        </div>

        <div className="border border-border-default rounded-md bg-surface overflow-hidden">
          {/* Day header row */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] text-[10px] uppercase tracking-[0.16em] text-muted border-b border-border-default">
            <div className="px-2 py-2" />
            {DAYS.map((label, i) => {
              const d = addDays(monday, i);
              return (
                <button
                  key={label}
                  onClick={() => setSelectedDay(i)}
                  className={cn(
                    "px-2 py-2 text-left border-l border-border-default transition-colors hover:bg-canvas/60",
                    selectedDay === i && "bg-canvas text-ink"
                  )}
                >
                  <span className="block">{label}</span>
                  <span className="block font-numeric text-ink text-sm normal-case tracking-normal">
                    {d.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)]">
            <div>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="h-14 px-2 py-1 text-[10px] font-numeric text-muted border-b border-border-default"
                >
                  {h.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>
            {DAYS.map((_, day) => (
              <div
                key={day}
                className="relative border-l border-border-default"
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="h-14 border-b border-border-default/60"
                  />
                ))}
                {dayBlocks(day).map((b) => (
                  <div
                    key={b.id}
                    className={cn(
                      "absolute left-1 right-1 rounded-sm border px-1.5 py-1 overflow-hidden",
                      statusStyle[b.status]
                    )}
                    style={{
                      top: `${(b.start - HOUR_START) * 3.5}rem`,
                      height: `${b.duration * 3.5 - 0.15}rem`,
                    }}
                  >
                    <p className="text-[11px] font-numeric leading-tight">
                      {b.start.toString().padStart(2, "0")}:00
                    </p>
                    <p className="text-[11px] leading-tight truncate">
                      {b.patient}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted">
          <LegendDot className="bg-accent-soft border-accent/40" label="Confirmada" />
          <LegendDot className="border-dashed border-accent/70" label="Pendiente" />
          <LegendDot className="bg-surface border-border-default" label="Realizada" />
        </div>
      </div>

      <aside className="space-y-3 h-fit lg:sticky lg:top-6">
        <div className="border border-border-default rounded-md bg-surface p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Día seleccionado
          </p>
          <p className="font-display text-base text-ink mt-1 leading-tight capitalize">
            {formatDayLong(addDays(monday, selectedDay))}
          </p>

          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label="Conf." value={counts.Confirmada} />
            <Stat label="Pend." value={counts.Pendiente} />
            <Stat label="Real." value={counts.Realizada} />
          </dl>
        </div>

        <div className="border border-border-default rounded-md bg-surface">
          <p className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted border-b border-border-default">
            Detalle
          </p>
          {selectedDayBlocks.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted italic">
              Sin agendamientos este día.
            </p>
          )}
          <ul className="divide-y divide-border-default">
            {selectedDayBlocks.map((b) => (
              <li
                key={b.id}
                className="px-3 py-2 text-sm flex items-center justify-between gap-3"
              >
                <span className="font-numeric text-muted">
                  {b.start.toString().padStart(2, "0")}:00
                </span>
                <span className="flex-1 truncate text-ink">{b.patient}</span>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider",
                    b.status === "Confirmada" && "text-accent",
                    b.status === "Pendiente" && "text-warn",
                    b.status === "Realizada" && "text-muted"
                  )}
                >
                  {b.status.slice(0, 4)}.
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border-default rounded-sm py-2">
      <p className="font-numeric text-xl text-ink leading-none">{value}</p>
      <p className="text-[10px] text-muted uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}

function LegendDot({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn("h-3 w-3 rounded-sm border", className)}
        aria-hidden
      />
      {label}
    </span>
  );
}
