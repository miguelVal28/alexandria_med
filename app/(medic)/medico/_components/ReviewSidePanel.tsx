"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PriorityPill } from "./PriorityPill";
import type { TriageCase } from "@/lib/mock-data/triage-cases";

export function ReviewSidePanel({
  trigger,
  case: c,
}: {
  trigger: React.ReactNode;
  case: TriageCase;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="contents"
        aria-label={`Revisar caso ${c.id}`}
      >
        {trigger}
      </button>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <PriorityPill priority={c.priority} />
            <span className="font-numeric text-xs text-muted">{c.id}</span>
          </div>
          <SheetTitle>{c.patient}</SheetTitle>
          <SheetDescription>
            {c.patientAge} años · ingreso {c.duration.toLowerCase()}
          </SheetDescription>
        </SheetHeader>

        <section className="space-y-5 mt-6 text-sm">
          <Field label="Resumen">{c.summary}</Field>

          <Field label="Síntomas reportados">
            <ul className="flex flex-wrap gap-1.5">
              {c.symptoms.map((s) => (
                <li
                  key={s}
                  className="px-2 py-0.5 bg-canvas border border-border-default text-ink text-xs rounded-sm"
                >
                  {s}
                </li>
              ))}
            </ul>
          </Field>

          <Field label="Tiempo de espera">
            <span className="font-numeric">{c.waitMinutes} min</span>
          </Field>

          <Field label="Antecedentes relevantes">
            <p className="text-muted">{c.history}</p>
          </Field>
        </section>

        <div className="mt-8 flex items-center gap-2 pt-4 border-t border-border-default">
          <Button variant="primary" size="sm" disabled>
            Confirmar prioridad
          </Button>
          <Button variant="outline" size="sm" disabled>
            Reclasificar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <div className="mt-1.5 text-ink">{children}</div>
    </div>
  );
}
