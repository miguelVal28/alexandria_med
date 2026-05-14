import { TriageQueueTable } from "../_components/TriageQueueTable";

export default function TriageQueuePage() {
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
          mié 13 may 2026 · 09:13
        </p>
      </header>
      <TriageQueueTable />
    </div>
  );
}
