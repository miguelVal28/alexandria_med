import { PatientTable } from "../_components/PatientTable";

export default function PacientesPage() {
  return (
    <div className="space-y-5">
      <header className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Pacientes
          </p>
          <h1 className="font-display text-2xl text-ink mt-1">
            Directorio clínico
          </h1>
        </div>
      </header>
      <PatientTable />
    </div>
  );
}
