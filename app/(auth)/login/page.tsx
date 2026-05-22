import { LoginForm } from "../_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          Alexandria
        </p>
        <h1 className="font-display text-3xl text-ink">Iniciar sesión</h1>
      </header>
      <LoginForm />
    </div>
  );
}