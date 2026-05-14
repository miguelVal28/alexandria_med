"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const COMMON_SYMPTOMS = [
  "Dolor de cabeza",
  "Fiebre",
  "Dolor de garganta",
  "Tos",
  "Náuseas",
  "Mareo",
  "Fatiga",
  "Dolor abdominal",
  "Dolor lumbar",
  "Dolor torácico",
  "Falta de aire",
  "Erupción en piel",
];

const DURATIONS = [
  { id: "hoy", label: "Hoy mismo" },
  { id: "dias", label: "Hace 2 o 3 días" },
  { id: "semana", label: "Más de una semana" },
];

const STEPS = ["Síntomas", "Detalles", "Confirmar"] as const;

export function TriageStepper() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<string>("hoy");
  const [submitted, setSubmitted] = useState(false);

  const toggleSymptom = (s: string) =>
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const canContinue =
    step === 0 ? selected.length > 0 || description.trim().length > 0 : true;

  if (submitted) {
    return (
      <div className="rounded-themed border border-border-default bg-surface p-10 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-ok/15 text-ok grid place-items-center">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="font-display text-3xl text-ink">Recibimos tu reporte</h2>
        <p className="text-muted max-w-md mx-auto">
          Un profesional revisará lo que nos contaste y te confirmaremos los
          siguientes pasos por mensaje o WhatsApp.
        </p>
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setStep(0);
              setSelected([]);
              setDescription("");
              setDuration("hoy");
            }}
          >
            Iniciar otro reporte
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Stepper current={step} />

      {step === 0 && (
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-2xl text-ink">
              ¿Qué estás sintiendo?
            </h2>
            <p className="text-muted mt-1 text-sm">
              Selecciona uno o varios síntomas. Si no aparece, descríbelo abajo.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((s) => {
                const active = selected.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSymptom(s)}
                    className={cn(
                      "px-4 py-2 rounded-full border text-sm transition-colors",
                      active
                        ? "bg-accent text-canvas border-accent"
                        : "bg-surface text-ink border-border-default hover:border-accent/60"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="describe"
              className="block font-display text-2xl text-ink"
            >
              Cuéntanos con tus palabras
            </label>
            <p className="text-muted mt-1 text-sm">
              Describe lo que sientes, en qué momento empezó, qué lo empeora.
            </p>
            <Textarea
              id="describe"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hoy desperté con dolor en la frente y un poco de náuseas…"
              className="mt-3 min-h-[140px]"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-ink">
              ¿Hace cuánto te sientes así?
            </h2>
            <p className="text-muted mt-1 text-sm">
              Esto nos ayuda a entender la urgencia.
            </p>
          </div>
          <RadioGroup
            value={duration}
            onValueChange={setDuration}
            className="grid gap-3 sm:grid-cols-3"
          >
            {DURATIONS.map((d) => (
              <label
                key={d.id}
                className={cn(
                  "flex items-center gap-3 rounded-themed border p-4 cursor-pointer transition-colors",
                  duration === d.id
                    ? "border-accent bg-accent-soft/40"
                    : "border-border-default hover:border-accent/60"
                )}
              >
                <RadioGroupItem value={d.id} id={d.id} />
                <span className="text-ink">{d.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-ink">
              Revisa antes de enviar
            </h2>
            <p className="text-muted mt-1 text-sm">
              Si algo no está bien, vuelve atrás y corrígelo.
            </p>
          </div>
          <div className="rounded-themed border border-border-default bg-surface divide-y divide-border-default">
            <ReviewRow
              label="Síntomas"
              value={
                selected.length > 0 ? selected.join(", ") : "—"
              }
            />
            <ReviewRow
              label="Descripción"
              value={description || "—"}
            />
            <ReviewRow
              label="Duración"
              value={DURATIONS.find((d) => d.id === duration)?.label ?? "—"}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canContinue}
          >
            Continuar
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => setSubmitted(true)}>
            Enviar reporte
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-4">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={cn(
                "h-7 w-7 rounded-full grid place-items-center text-xs font-medium border transition-colors",
                done && "bg-accent border-accent text-canvas",
                active && "border-accent text-accent bg-accent-soft/40",
                !done && !active && "border-border-default text-muted"
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-sm",
                active ? "text-ink" : "text-muted"
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="ml-2 h-px w-10 bg-border-default" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
      <span className="text-xs uppercase tracking-[0.18em] text-muted sm:w-32 shrink-0">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}