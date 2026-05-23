import { Button } from "@/components/ui/button";
import {
  listAppointmentsForMedic,
  type MedicAppointment,
} from "./_lib/agenda.repository";
import { transitionAppointmentAction } from "./_lib/agenda.actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Realizada",
};

const STATUS_TONE: Record<string, string> = {
  pending: "bg-warn/10 text-warn border-warn/30",
  confirmed: "bg-accent-soft text-accent border-accent/30",
  cancelled: "bg-surface text-muted border-border-default",
  completed: "bg-ok/10 text-ok border-ok/30",
};

function formatBogota(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("es-CO", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "America/Bogota",
    }),
    time: d.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Bogota",
    }),
  };
}

export default async function AgendaPage() {
  const appointments = await listAppointmentsForMedic();

  return (
    <div className="space-y-5">
      <header className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Agenda
          </p>
          <h1 className="font-display text-2xl text-ink mt-1">Tus citas</h1>
        </div>
        <p className="text-xs text-muted font-numeric">
          {appointments.length} cita{appointments.length === 1 ? "" : "s"} · zona
          America/Bogota
        </p>
      </header>

      <div className="border border-border-default rounded-md bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-canvas text-[10px] uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="text-left px-3 py-2 font-medium w-28">Cuándo</th>
              <th className="text-left px-3 py-2 font-medium">Paciente</th>
              <th className="text-left px-3 py-2 font-medium w-28">Sede</th>
              <th className="text-left px-3 py-2 font-medium">Motivo</th>
              <th className="text-left px-3 py-2 font-medium w-28">Estado</th>
              <th className="text-right px-3 py-2 font-medium w-56">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {appointments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-10 text-center text-muted text-sm"
                >
                  Sin citas asignadas.
                </td>
              </tr>
            ) : (
              appointments.map((a) => <Row key={a.id} appointment={a} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ appointment: a }: { appointment: MedicAppointment }) {
  const { date, time } = formatBogota(a.scheduled_at);
  const tone = STATUS_TONE[a.status] ?? "";
  const label = STATUS_LABEL[a.status] ?? a.status;

  return (
    <tr className="hover:bg-canvas/40 align-top">
      <td className="px-3 py-3 font-numeric text-ink">
        <p>{date}</p>
        <p className="text-muted">{time}</p>
      </td>
      <td className="px-3 py-3 text-ink">
        <p>{a.patient?.full_name ?? "—"}</p>
        {a.patient?.risk && (
          <p className="text-[10px] text-muted uppercase tracking-wider">
            riesgo · {a.patient.risk}
          </p>
        )}
      </td>
      <td className="px-3 py-3 text-muted">{a.site?.name ?? "—"}</td>
      <td className="px-3 py-3 text-muted">{a.reason}</td>
      <td className="px-3 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${tone}`}
        >
          {label}
        </span>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="inline-flex gap-2">
          {a.status === "pending" && (
            <TransitionButton
              appointmentId={a.id}
              newStatus="confirmed"
              label="Confirmar"
              variant="primary"
            />
          )}
          {a.status === "confirmed" && (
            <TransitionButton
              appointmentId={a.id}
              newStatus="completed"
              label="Completar"
              variant="primary"
            />
          )}
          {(a.status === "pending" || a.status === "confirmed") && (
            <TransitionButton
              appointmentId={a.id}
              newStatus="cancelled"
              label="Cancelar"
              variant="outline"
            />
          )}
        </div>
      </td>
    </tr>
  );
}

function TransitionButton({
  appointmentId,
  newStatus,
  label,
  variant,
}: {
  appointmentId: string;
  newStatus: "confirmed" | "cancelled" | "completed";
  label: string;
  variant: "primary" | "outline";
}) {
  return (
    <form action={transitionAppointmentAction}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="newStatus" value={newStatus} />
      <Button type="submit" size="sm" variant={variant}>
        {label}
      </Button>
    </form>
  );
}