import type { Priority } from "@/lib/mock-data/triage-cases";
import { cn } from "@/lib/utils";

const map: Record<Priority, string> = {
  ALTA: "bg-danger/15 text-danger border-danger/30",
  MEDIA: "bg-warn/15 text-warn border-warn/30",
  BAJA: "bg-surface text-muted border-border-default",
};

export function PriorityPill({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-numeric tracking-wider uppercase border rounded-sm",
        map[priority]
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          priority === "ALTA" && "bg-danger",
          priority === "MEDIA" && "bg-warn",
          priority === "BAJA" && "bg-muted"
        )}
      />
      {priority}
    </span>
  );
}
