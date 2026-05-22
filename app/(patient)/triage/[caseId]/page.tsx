import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, Clock } from "lucide-react";
import { findTriageCaseById } from "../_lib/triage.repository";

const STATUS_LABEL: Record<string, string> = {
  submitted: "Recibido",
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
  const triageCase = await findTriageCaseById(params.caseId);
  if (!triageCase) notFound();

  const statusLabel = STATUS_LABEL[triageCase.status] ?? triageCase.status;
  const submittedAt = new Date(triageCase.submitted_at).toLocaleString(
    "es-CO",
    { dateStyle: "long", timeStyle: "short" },
  );

  return (
    <div className="space-y-10 max-w-2xl">
      <header className="space-y-3">
        <div className="mx-auto h-14 w-14 rounded-full bg-ok/15 text-ok grid place-items-center">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl text-ink">
          Recibimos tu reporte.
        </h1>
        <p className="text-muted">
          Un profesional revisará lo que nos contaste. Te avisaremos por la
          plataforma cuando esté listo el siguiente paso.
        </p>
      </header>

      <section className="rounded-themed border border-border-default bg-surface divide-y divide-border-default">
        <Row label="Estado">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm text-accent">
            <Clock className="h-3.5 w-3.5" />
            {statusLabel}
          </span>
        </Row>
        <Row label="Recibido">{submittedAt}</Row>
        <Row label="Síntomas">
          {triageCase.symptoms.length > 0 ? triageCase.symptoms.join(", ") : "—"}
        </Row>
        <Row label="Duración">{triageCase.duration_text ?? "—"}</Row>
        <Row label="Resumen">{triageCase.summary}</Row>
      </section>

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

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
      <span className="text-xs uppercase tracking-[0.18em] text-muted sm:w-28 shrink-0">
        {label}
      </span>
      <span className="text-ink">{children}</span>
    </div>
  );
}