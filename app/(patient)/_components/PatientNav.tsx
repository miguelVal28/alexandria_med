import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/triage", label: "Reportar síntomas" },
  { href: "/citas", label: "Mis citas" },
  { href: "/mensajes", label: "Mensajes" },
];

export function PatientNav() {
  return (
    <header className="border-b border-border-default bg-canvas/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl text-ink leading-none">
          Alexandria
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-muted hover:text-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-sm text-ink">María Salazar</p>
            <p className="text-xs text-muted">Paciente</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-accent text-canvas grid place-items-center font-display text-sm">
            M
          </div>
        </div>
      </div>
    </header>
  );
}