import Link from "next/link";
import {
  listMedicsForBooking,
  listSitesForBooking,
  loadBookingPrefill,
} from "../_lib/appointments.repository";
import { BookingForm } from "./_components/BookingForm";

export default async function NuevaCitaPage({
  searchParams,
}: {
  searchParams: { triageCaseId?: string };
}) {
  const [medics, sites, prefill] = await Promise.all([
    listMedicsForBooking(),
    listSitesForBooking(),
    searchParams.triageCaseId
      ? loadBookingPrefill(searchParams.triageCaseId)
      : Promise.resolve(null),
  ]);

  const isFromTriage = prefill !== null;

  return (
    <div className="space-y-6 max-w-2xl">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">
          Nueva cita
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-ink">
          {isFromTriage
            ? "Agenda el seguimiento de tu triaje."
            : "Reserva un espacio con tu equipo médico."}
        </h1>
        {isFromTriage ? (
          <p className="text-muted text-sm">
            Pre-llenamos médico y motivo con el caso aprobado. Solo elige sede y
            horario. La cita queda en{" "}
            <span className="font-numeric">pendiente</span> hasta que el médico la confirme.
          </p>
        ) : (
          <p className="text-muted text-sm">
            Elige profesional, sede y horario. La cita queda en{" "}
            <span className="font-numeric">pendiente</span> hasta que el médico la confirme.
          </p>
        )}
        {isFromTriage && (
          <Link
            href={`/triage/${prefill.triageCaseId}`}
            className="inline-block text-sm text-accent hover:underline"
          >
            ← Ver el caso de triaje
          </Link>
        )}
      </header>

      <BookingForm medics={medics} sites={sites} prefill={prefill} />
    </div>
  );
}