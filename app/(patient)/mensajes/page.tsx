import { MessageThread } from "../_components/MessageThread";
import { conversations } from "@/lib/mock-data/messages";

export default function MensajesPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">
          Mensajes
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink">
          Conversaciones con tu <span className="italic text-accent">equipo</span>.
        </h1>
        <p className="text-muted max-w-xl">
          Todo queda registrado en tu historial. No compartas información
          médica por canales externos.
        </p>
      </header>

      <MessageThread conversations={conversations} />
    </div>
  );
}
