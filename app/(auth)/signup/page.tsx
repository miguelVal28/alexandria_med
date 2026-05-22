import { SignupForm } from "../_components/SignupForm";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          Alexandria
        </p>
        <h1 className="font-display text-3xl text-ink">Crea tu cuenta</h1>
        <p className="text-sm text-muted">
          Conéctate con tu equipo médico de confianza.
        </p>
      </header>
      <SignupForm />
    </div>
  );
}