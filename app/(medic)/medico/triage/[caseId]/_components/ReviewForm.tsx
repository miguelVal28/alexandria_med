"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  reviewCaseAction,
  type ReviewActionState,
} from "../_lib/triage-review.actions";
import type { TriageOutcome } from "../_lib/triage-review.schema";

const PRIORITY_OPTIONS = [
  { value: 1, label: "P1 — Emergencia (riesgo vital)" },
  { value: 2, label: "P2 — Urgente, tiempo crítico" },
  { value: 3, label: "P3 — Urgente, no vital" },
  { value: 4, label: "P4 — Rutinario" },
  { value: 5, label: "P5 — No urgente" },
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Procesando…" : label}
    </Button>
  );
}

export function ReviewForm({
  caseId,
  assessmentId,
  aiSuggestedPriority,
}: {
  caseId: string;
  assessmentId: string;
  aiSuggestedPriority: number | null;
}) {
  const [priority, setPriority] = useState<number>(aiSuggestedPriority ?? 3);
  const [outcome, setOutcome] = useState<TriageOutcome>("approved");
  const [state, action] = useFormState<ReviewActionState, FormData>(
    reviewCaseAction,
    null,
  );

  const willOverride =
    aiSuggestedPriority !== null && priority !== aiSuggestedPriority;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="caseId" value={caseId} />
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <input type="hidden" name="finalPriority" value={priority} />
      <input type="hidden" name="outcome" value={outcome} />

      {state?.ok === false && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">
          Prioridad clínica final
        </legend>
        <p className="text-xs text-muted">
          {aiSuggestedPriority !== null ? (
            <>
              IA sugiere{" "}
              <span className="font-numeric text-ink">
                P{aiSuggestedPriority}
              </span>
              .{" "}
              {willOverride
                ? "Tu selección cambia la prioridad (overridden)."
                : "Tu selección coincide con la IA (accepted)."}
            </>
          ) : (
            "La IA no produjo una sugerencia; asigna prioridad manualmente."
          )}
        </p>
        <div className="space-y-1">
          {PRIORITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer text-sm ${
                priority === opt.value
                  ? "border-accent bg-accent-soft/40"
                  : "border-border-default hover:border-accent/60"
              }`}
            >
              <input
                type="radio"
                name="priorityRadio"
                value={opt.value}
                checked={priority === opt.value}
                onChange={() => setPriority(opt.value)}
                className="accent-accent"
              />
              <span className="text-ink">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Cierre</legend>
        <div className="space-y-1">
          <label
            className={`flex items-start gap-3 rounded-md border px-3 py-2 cursor-pointer text-sm ${
              outcome === "approved"
                ? "border-accent bg-accent-soft/40"
                : "border-border-default hover:border-accent/60"
            }`}
          >
            <input
              type="radio"
              name="outcomeRadio"
              value="approved"
              checked={outcome === "approved"}
              onChange={() => setOutcome("approved")}
              className="mt-0.5 accent-accent"
            />
            <span>
              <span className="text-ink block">Aprobar caso</span>
              <span className="text-xs text-muted">
                El caso pasa a estado <span className="font-numeric">approved</span>{" "}
                con la prioridad seleccionada.
              </span>
            </span>
          </label>
          <label
            className={`flex items-start gap-3 rounded-md border px-3 py-2 cursor-pointer text-sm ${
              outcome === "escalated"
                ? "border-warn bg-warn/10"
                : "border-border-default hover:border-warn/60"
            }`}
          >
            <input
              type="radio"
              name="outcomeRadio"
              value="escalated"
              checked={outcome === "escalated"}
              onChange={() => setOutcome("escalated")}
              className="mt-0.5 accent-warn"
            />
            <span>
              <span className="text-ink block">Escalar caso</span>
              <span className="text-xs text-muted">
                El caso pasa a <span className="font-numeric">escalated</span>{" "}
                para revisión por otra especialidad.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="flex justify-end">
        <SubmitButton label="Confirmar decisión" />
      </div>
    </form>
  );
}