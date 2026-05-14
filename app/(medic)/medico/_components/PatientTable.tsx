"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { patients, specialties, type Risk } from "@/lib/mock-data/patients";
import { cn } from "@/lib/utils";

const ALL = "all";
const ALL_RISKS: Risk[] = ["ALTA", "MEDIA", "BAJA"];

const riskTone: Record<Risk, "danger" | "warn" | "neutral"> = {
  ALTA: "danger",
  MEDIA: "warn",
  BAJA: "neutral",
};

type LastVisitWindow = "any" | "7" | "30" | "90";

const lastVisitWindowDays: Record<LastVisitWindow, number | null> = {
  any: null,
  "7": 7,
  "30": 30,
  "90": 90,
};

const today = new Date("2026-05-13T00:00");

function daysSince(iso: string) {
  const d = new Date(iso + "T00:00");
  return Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function PatientTable() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string>(ALL);
  const [risks, setRisks] = useState<Risk[]>(ALL_RISKS);
  const [window, setWindow] = useState<LastVisitWindow>("any");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const limit = lastVisitWindowDays[window];
    return patients.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (specialty !== ALL && p.specialty !== specialty) return false;
      if (!risks.includes(p.risk)) return false;
      if (limit !== null && daysSince(p.lastVisit) > limit) return false;
      return true;
    });
  }, [query, specialty, risks, window]);

  const toggleRisk = (r: Risk) =>
    setRisks((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
      <div className="space-y-3 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar paciente por nombre…"
            className="pl-9"
          />
        </div>

        <div className="border border-border-default rounded-md bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-[10px] uppercase tracking-[0.16em] text-muted">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Nombre</th>
                <th className="text-left px-3 py-2 font-medium w-16">Edad</th>
                <th className="text-left px-3 py-2 font-medium">Especialidad</th>
                <th className="text-left px-3 py-2 font-medium">Última visita</th>
                <th className="text-left px-3 py-2 font-medium">Riesgo</th>
                <th className="text-left px-3 py-2 font-medium">Etiquetas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-canvas/40 cursor-pointer"
                  title="Detalle de paciente — próximamente"
                >
                  <td className="px-3 py-2 text-ink">{p.name}</td>
                  <td className="px-3 py-2 font-numeric text-muted">{p.age}</td>
                  <td className="px-3 py-2 text-muted">{p.specialty}</td>
                  <td className="px-3 py-2 font-numeric text-muted">
                    {p.lastVisit}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={riskTone[p.risk]}>{p.risk}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.length === 0 && (
                        <span className="text-muted/60 text-xs">—</span>
                      )}
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] tracking-wide uppercase border border-border-default text-muted rounded-sm px-1.5 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted">
                    Sin resultados para los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="px-3 py-2 border-t border-border-default text-[11px] text-muted font-numeric flex items-center justify-between">
            <span>{filtered.length} de {patients.length} pacientes</span>
            <span>actualizado · ahora</span>
          </div>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-6 h-fit">
        <FilterBlock label="Especialidad">
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full h-9 rounded-md border border-border-default bg-canvas px-2 text-sm text-ink focus:outline-none focus:border-accent"
          >
            <option value={ALL}>Todas</option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FilterBlock>

        <FilterBlock label="Riesgo">
          <div className="space-y-1.5">
            {ALL_RISKS.map((r) => (
              <label
                key={r}
                className="flex items-center gap-2 cursor-pointer text-sm text-ink"
              >
                <input
                  type="checkbox"
                  checked={risks.includes(r)}
                  onChange={() => toggleRisk(r)}
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock label="Última visita">
          <div className="space-y-1.5">
            {(
              [
                ["any", "Cualquiera"],
                ["7", "Últimos 7 días"],
                ["30", "Últimos 30 días"],
                ["90", "Últimos 90 días"],
              ] as const
            ).map(([id, label]) => (
              <label
                key={id}
                className={cn(
                  "flex items-center gap-2 cursor-pointer text-sm",
                  window === id ? "text-ink" : "text-muted"
                )}
              >
                <input
                  type="radio"
                  name="lastvisit"
                  checked={window === id}
                  onChange={() => setWindow(id)}
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </FilterBlock>
      </aside>
    </div>
  );
}

function FilterBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border-default rounded-md bg-surface p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}
