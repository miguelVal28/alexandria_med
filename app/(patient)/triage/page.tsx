import { TriageStepper } from "../_components/TriageStepper";

export default function TriagePage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">
          Reportar síntomas
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink">
          Cuéntanos cómo te <span className="italic text-accent">sientes</span>.
        </h1>
        <p className="text-muted max-w-xl">
          Toma un par de minutos. Mientras más claro seas, mejor podremos
          orientarte.
        </p>
      </header>

      <TriageStepper />
    </div>
  );
}