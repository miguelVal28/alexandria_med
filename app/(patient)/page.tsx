import { Activity, CalendarClock, MessageCircle, Phone } from "lucide-react";
import { HeroGreeting } from "./_components/HeroGreeting";
import { PrimaryActionCard } from "./_components/PrimaryActionCard";
import { appointments } from "@/lib/mock-data/appointments";

const nextAppointment = appointments.find((a) => a.status !== "Realizada");

const formatLongDate = (iso: string) => {
  const d = new Date(iso + "T00:00");
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export default function PatientHomePage() {
  return (
    <div className="space-y-16">
      <HeroGreeting name="María" />

      <section className="grid sm:grid-cols-2 gap-5">
        <PrimaryActionCard
          href="/triage"
          eyebrow="Lo más urgente"
          title="Reportar síntomas"
          description="Cuéntanos cómo te sientes. Un profesional revisará tu reporte."
          Icon={Activity}
          emphasis
        />
        <PrimaryActionCard
          href="/citas"
          eyebrow="Tu agenda"
          title="Mis citas"
          description="Consulta próximas citas, ubicación y horario. Sin sorpresas."
          Icon={CalendarClock}
        />
      </section>

      <section className="grid sm:grid-cols-2 gap-5">
        <article className="rounded-themed bg-surface border border-border-default p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Tu próxima cita
          </p>
          {nextAppointment ? (
            <div className="mt-3 space-y-2">
              <p className="font-display text-2xl text-ink">
                {nextAppointment.doctor}
              </p>
              <p className="text-sm text-muted">
                {nextAppointment.specialty}
              </p>
              <div className="pt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-display text-xl text-accent">
                  {formatLongDate(nextAppointment.date)}
                </span>
                <span className="text-ink">{nextAppointment.time}</span>
              </div>
              <p className="text-sm text-muted">{nextAppointment.location}</p>
            </div>
          ) : (
            <p className="mt-3 text-muted">
              No tienes citas próximas. Agenda una desde el botón de arriba.
            </p>
          )}
        </article>

        <article className="rounded-themed border border-border-default p-6 flex flex-col">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Contáctanos
          </p>
          <p className="mt-3 font-display text-2xl text-ink leading-tight">
            ¿Una urgencia, una duda?
          </p>
          <p className="text-sm text-muted mt-2">
            Nuestro equipo administrativo te responde en horario hábil.
          </p>
          <div className="mt-5 flex items-center gap-3 text-ink">
            <span className="h-9 w-9 rounded-full bg-accent-soft text-accent grid place-items-center">
              <Phone className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">(604) 444-0000</p>
              <p className="text-xs text-muted">Lun a vie · 7:00 a 18:00</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-ink">
            <span className="h-9 w-9 rounded-full bg-accent-soft text-accent grid place-items-center">
              <MessageCircle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">WhatsApp Alexandria</p>
              <p className="text-xs text-muted">+57 300 123 4567</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}