import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentMedic } from "../_lib/medic.loader";
import { loadPendingQueue } from "./_lib/triage-queue.loader";
import { claimCaseAction } from "./_lib/triage-queue.actions";

const PRIORITY_LABEL: Record<number, string> = {
  1: "P1 · Emergencia",
  2: "P2 · Urgente",
  3: "P3 · Urgente no vital",
  4: "P4 · Rutinario",
  5: "P5 · No urgente",
};

const PRIORITY_TONE: Record<number, string> = {
  1: "bg-danger/10 text-danger border-danger/30",
  2: "bg-warn/10 text-warn border-warn/30",
  3: "bg-accent-soft text-accent border-accent/30",
  4: "bg-surface text-muted border-border-default",
  5: "bg-surface text-muted border-border-default",
};

function waitMinutesFromIso(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

export default async function TriageQueuePage() {
  const medic = await getCurrentMedic();
  const rows = await loadPendingQueue();

  return (
    <div className="space-y-5">
      <header className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Triage
          </p>
          <h1 className="font-display text-2xl text-ink mt-1">
            Cola de casos
          </h1>
        </div>
        <p className="text-xs text-muted font-numeric">
          {rows.length} casos · {medic?.full_name ?? "—"}
        </p>
      </header>

      <div className="border border-border-default rounded-md bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-canvas text-[10px] uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="text-left px-3 py-2 font-medium w-32">Caso</th>
              <th className="text-left px-3 py-2 font-medium w-40">Prioridad IA</th>
              <th className="text-left px-3 py-2 font-medium w-20">Espera</th>
              <th className="text-left px-3 py-2 font-medium">Resumen</th>
              <th className="text-left px-3 py-2 font-medium">Síntomas</th>
              <th className="text-right px-3 py-2 font-medium w-32">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-10 text-center text-muted text-sm"
                >
                  Sin casos pendientes en este momento.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const priority = row.ai?.suggested_priority;
                const tone =
                  priority != null
                    ? PRIORITY_TONE[priority]
                    : "bg-surface text-muted border-border-default";
                const label =
                  priority != null ? PRIORITY_LABEL[priority] : "Sin clasificar";
                const isMine = row.assigned_medic_id === medic?.id;
                return (
                  <tr key={row.id} className="hover:bg-canvas/40 align-top">
                    <td className="px-3 py-2.5 font-numeric text-muted">
                      {row.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${tone}`}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-numeric text-ink">
                      {waitMinutesFromIso(row.submitted_at)}m
                    </td>
                    <td className="px-3 py-2.5 text-muted truncate max-w-[24rem]">
                      {row.summary}
                    </td>
                    <td className="px-3 py-2.5 text-muted">
                      {row.symptoms.length > 0
                        ? row.symptoms.slice(0, 3).join(", ") +
                          (row.symptoms.length > 3 ? "…" : "")
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {isMine ? (
                        <Link
                          href={`/medico/triage/${row.id}`}
                          className="text-sm text-accent hover:underline"
                        >
                          Continuar →
                        </Link>
                      ) : row.assigned_medic_id === null ? (
                        <form action={claimCaseAction}>
                          <input type="hidden" name="caseId" value={row.id} />
                          <Button type="submit" variant="secondary" size="sm">
                            Tomar caso
                          </Button>
                        </form>
                      ) : (
                        <span className="text-xs text-muted">
                          Asignado a otro médico
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted font-numeric">
        Los nombres de los pacientes aparecen al tomar el caso (RLS).
      </p>
    </div>
  );
}