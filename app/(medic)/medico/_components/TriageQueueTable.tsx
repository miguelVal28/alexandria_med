"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triageCases, type Priority } from "@/lib/mock-data/triage-cases";
import { PriorityPill } from "./PriorityPill";
import { ReviewSidePanel } from "./ReviewSidePanel";
import { cn } from "@/lib/utils";

type SortKey = "priority" | "wait" | "id";
type SortDir = "asc" | "desc";

const priorityRank: Record<Priority, number> = { ALTA: 0, MEDIA: 1, BAJA: 2 };

export function TriageQueueTable() {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "priority",
    dir: "asc",
  });

  const sorted = useMemo(() => {
    const arr = [...triageCases];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sort.key === "priority") {
        cmp = priorityRank[a.priority] - priorityRank[b.priority];
        if (cmp === 0) cmp = a.waitMinutes - b.waitMinutes;
      } else if (sort.key === "wait") {
        cmp = a.waitMinutes - b.waitMinutes;
      } else {
        cmp = a.id.localeCompare(b.id);
      }
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [sort]);

  const toggle = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );

  return (
    <div className="border border-border-default rounded-md bg-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-canvas text-[10px] uppercase tracking-[0.16em] text-muted">
          <tr>
            <SortHeader
              label="ID"
              active={sort.key === "id"}
              dir={sort.dir}
              onClick={() => toggle("id")}
              className="w-24"
            />
            <SortHeader
              label="Prioridad"
              active={sort.key === "priority"}
              dir={sort.dir}
              onClick={() => toggle("priority")}
              className="w-28"
            />
            <SortHeader
              label="Espera"
              active={sort.key === "wait"}
              dir={sort.dir}
              onClick={() => toggle("wait")}
              className="w-20"
            />
            <th className="text-left px-3 py-2 font-medium">Paciente</th>
            <th className="text-left px-3 py-2 font-medium">Síntomas</th>
            <th className="text-right px-3 py-2 font-medium w-28">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default">
          {sorted.map((c) => (
            <tr key={c.id} className="hover:bg-canvas/40">
              <td className="px-3 py-2.5 font-numeric text-muted">{c.id}</td>
              <td className="px-3 py-2.5">
                <PriorityPill priority={c.priority} />
              </td>
              <td className="px-3 py-2.5 font-numeric text-ink">
                {c.waitMinutes}m
              </td>
              <td className="px-3 py-2.5 text-ink">
                <span className="block leading-tight">{c.patient}</span>
                <span className="text-xs text-muted font-numeric">
                  {c.patientAge} años
                </span>
              </td>
              <td className="px-3 py-2.5 text-muted truncate max-w-[24rem]">
                {c.summary}
              </td>
              <td className="px-3 py-2.5 text-right">
                <ReviewSidePanel
                  case={c}
                  trigger={
                    <Button variant="secondary" size="sm">
                      Revisar
                    </Button>
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 border-t border-border-default text-[11px] text-muted font-numeric flex items-center justify-between">
        <span>{sorted.length} casos pendientes</span>
        <span>refresco automático · 30s</span>
      </div>
    </div>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={cn("text-left px-3 py-2 font-medium", className)}>
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 uppercase tracking-[0.16em] text-[10px]",
          active ? "text-ink" : "text-muted hover:text-ink"
        )}
      >
        {label}
        {!active && <ArrowUpDown className="h-3 w-3" />}
        {active &&
          (dir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          ))}
      </button>
    </th>
  );
}
