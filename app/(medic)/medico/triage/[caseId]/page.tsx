import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { loadCaseDetail } from "./_lib/triage-review.repository";
import { ReviewForm } from "./_components/ReviewForm";

const ACTOR_LABEL: Record<string, string> = {
  patient: "Paciente",
  ai: "Asistente IA",
  clinician: "Clínico",
};

const STATUS_LABEL: Record<string, string> = {
  submitted: "Recibido",
  pending_medic_assessment: "En cola",
  approved: "Aprobado",
  escalated: "Escalado",
  completed: "Cerrado",
};

export default async function MedicCaseDetailPage({
  params,
}: {
  params: { caseId: string };
}) {
  const detail = await loadCaseDetail(params.caseId);
  if (!detail) notFound();

  const { triageCase, patient, interactions, latestAssessment } = detail;
  const age = patient
    ? Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) /
          (365.25 * 24 * 3600 * 1000),
      )
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/medico/triage"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Volver a la cola
      </Link>

      <header className="flex items-baseline justify-between border-b border-border-default pb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Caso · {triageCase.id.slice(0, 8)}
          </p>
          <h1 className="font-display text-2xl text-ink mt-1">
            {triageCase.summary}
          </h1>
        </div>
        <span className="text-xs text-muted font-numeric uppercase tracking-wider">
          {STATUS_LABEL[triageCase.status] ?? triageCase.status}
        </span>
      </header>

      <section className="grid grid-cols-2 gap-6">
        <div className="space-y-3 text-sm">
          <h2 className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Paciente
          </h2>
          {patient ? (
            <>
              <p className="text-ink">{patient.full_name}</p>
              <p className="font-numeric text-muted">
                {patient.document_type} {patient.document}
                {age !== null ? ` · ${age} años` : ""}
              </p>
              <p className="text-muted">
                Riesgo:{" "}
                <span className="font-numeric text-ink">{patient.risk}</span>
                {patient.tags.length > 0 && (
                  <span className="text-muted"> · {patient.tags.join(", ")}</span>
                )}
              </p>
            </>
          ) : (
            <p className="text-muted">
              Aún no asignado · información del paciente oculta por RLS.
            </p>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <h2 className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Reporte
          </h2>
          <p className="text-muted">
            Síntomas:{" "}
            <span className="text-ink">
              {triageCase.symptoms.length > 0
                ? triageCase.symptoms.join(", ")
                : "—"}
            </span>
          </p>
          <p className="text-muted">
            Duración:{" "}
            <span className="text-ink">{triageCase.duration_text ?? "—"}</span>
          </p>
          <p className="text-muted">
            Recibido:{" "}
            <span className="font-numeric text-ink">
              {new Date(triageCase.submitted_at).toLocaleString("es-CO", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-[0.18em] text-muted">
          Transcripción
        </h2>
        <ol className="rounded-md border border-border-default bg-surface divide-y divide-border-default">
          {interactions.map((turn) => (
            <li key={turn.id} className="px-4 py-3 text-sm">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                Turno {turn.turn_number} · {ACTOR_LABEL[turn.actor] ?? turn.actor}
              </p>
              <p className="text-ink mt-1 whitespace-pre-wrap">{turn.content}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-[0.18em] text-muted">
          Evaluación IA
        </h2>
        {latestAssessment ? (
          <div className="rounded-md border border-border-default bg-surface p-4 space-y-2 text-sm">
            <p className="text-ink">
              Prioridad sugerida:{" "}
              <span className="font-numeric">
                {latestAssessment.suggested_priority ?? "—"}
              </span>
            </p>
            <p className="text-muted text-xs font-numeric">
              modelo: {latestAssessment.model_version} · execution_id:{" "}
              {latestAssessment.n8n_execution_id} · iteración{" "}
              {latestAssessment.iteration_number}
            </p>
            {typeof (latestAssessment.raw_output as { reasoning?: string })
              ?.reasoning === "string" && (
              <p className="text-muted">
                {
                  (latestAssessment.raw_output as { reasoning?: string })
                    .reasoning
                }
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">Sin evaluaciones de IA registradas.</p>
        )}
      </section>

      {triageCase.status === "pending_medic_assessment" && latestAssessment && (
        <section className="space-y-3 border-t border-border-default pt-6">
          <h2 className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Decisión clínica
          </h2>
          <ReviewForm
            caseId={triageCase.id}
            assessmentId={latestAssessment.id}
            aiSuggestedPriority={latestAssessment.suggested_priority}
          />
        </section>
      )}

      {triageCase.status !== "pending_medic_assessment" && (
        <section className="border-t border-border-default pt-4">
          <p className="text-sm text-muted">
            Este caso ya fue resuelto. Su estado actual es{" "}
            <span className="font-numeric text-ink">{triageCase.status}</span>.
          </p>
        </section>
      )}
    </div>
  );
}