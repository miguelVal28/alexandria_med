import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarPlus, Check, Clock, ShieldCheck } from "lucide-react";
import { loadCaseWithInteractions } from "../_lib/triage.repository";
import {
  ConversationFlow,
  type ConversationTurn,
} from "./_components/ConversationFlow";

const STATUS_LABEL: Record<string, string> = {
  submitted: "Conversando con el asistente",
  pending_medic_assessment: "En revisión por un profesional",
  approved: "Aprobado",
  escalated: "Escalado",
  completed: "Cerrado",
};

export default async function TriageCaseDetailPage({
  params,
}: {
  params: { caseId: string };
}) {
  const data = await loadCaseWithInteractions(params.caseId);
  if (!data) notFound();

  const { triageCase, interactions } = data;
  const statusLabel = STATUS_LABEL[triageCase.status] ?? triageCase.status;
  const submittedAt = new Date(triageCase.submitted_at).toLocaleString(
    "es-CO",
    { dateStyle: "long", timeStyle: "short" },
  );

  const turns: ConversationTurn[] = interactions.map((t) => ({
    id: t.id,
    turnNumber: t.turn_number,
    actor: t.actor as "patient" | "ai" | "clinician",
    content: t.content,
    createdAt: t.created_at,
  }));

  // The conversation is awaiting the patient's response if the last AI turn
  // doesn't have a patient reply yet AND the case is still in 'submitted'.
  const isSubmitted = triageCase.status === "submitted";
  const lastTurn = turns[turns.length - 1];
  const awaitingResponse = isSubmitted && lastTurn?.actor === "ai";

  return (
    <div className="space-y-8 max-w-2xl">
      <header className="space-y-3">
        {triageCase.status === "submitted" ? (
          <div className="inline-flex items-center gap-2 text-xs text-muted">
            <Clock className="h-4 w-4" />
            <span>{statusLabel}</span>
          </div>
        ) : (
          <div className="mx-auto h-14 w-14 rounded-full bg-ok/15 text-ok grid place-items-center">
            {triageCase.status === "approved" ||
            triageCase.status === "pending_medic_assessment" ? (
              <Check className="h-7 w-7" />
            ) : (
              <ShieldCheck className="h-7 w-7" />
            )}
          </div>
        )}
        <h1 className="font-display text-3xl text-ink">
          {triageCase.status === "submitted"
            ? "Cuéntanos un poco más"
            : "Recibimos tu reporte."}
        </h1>
        <p className="text-muted text-sm">
          Caso {triageCase.id.slice(0, 8)} · Recibido {submittedAt}
        </p>
      </header>

      <ConversationFlow
        caseId={triageCase.id}
        turns={turns}
        awaitingResponse={awaitingResponse}
      />

      {triageCase.status !== "submitted" && (
        <section className="rounded-themed border border-border-default bg-surface p-5 text-sm space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Estado
          </p>
          <p className="text-ink">{statusLabel}</p>
          {triageCase.priority !== null && (
            <p className="text-muted">
              Prioridad asignada:{" "}
              <span className="text-ink font-numeric">
                P{triageCase.priority}
              </span>
            </p>
          )}
          <p className="text-muted">Síntomas: {triageCase.symptoms.join(", ") || "—"}</p>
          <p className="text-muted">Duración: {triageCase.duration_text ?? "—"}</p>
        </section>
      )}

      {triageCase.status === "approved" && (
        <section className="rounded-themed border border-accent/30 bg-accent-soft/40 p-5 space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-accent">
              Próximo paso
            </p>
            <p className="text-ink text-sm">
              Tu caso fue aprobado. Agenda una cita de seguimiento con el
              profesional que lo revisó.
            </p>
          </div>
          <Link
            href={`/citas/nueva?triageCaseId=${triageCase.id}`}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-themed bg-accent text-canvas text-sm font-medium hover:opacity-90"
          >
            <CalendarPlus className="h-4 w-4" />
            Agendar cita
          </Link>
        </section>
      )}

      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-4 rounded-themed bg-accent text-canvas text-sm font-medium hover:opacity-90"
        >
          Volver al inicio
        </Link>
        <Link
          href="/triage"
          className="inline-flex items-center justify-center h-10 px-4 rounded-themed border border-border-default text-sm font-medium text-ink hover:border-accent/60"
        >
          Otro reporte
        </Link>
      </div>
    </div>
  );
}