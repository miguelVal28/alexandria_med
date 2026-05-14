import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number | string;
  delta?: string;
  Icon: LucideIcon;
  emphasis?: boolean;
};

export function KpiTile({ label, value, delta, Icon, emphasis = false }: Props) {
  return (
    <div
      className={cn(
        "border border-border-default bg-surface rounded-md p-4 flex flex-col gap-2",
        emphasis && "border-accent/40"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
          {label}
        </span>
        <Icon
          className={cn("h-4 w-4", emphasis ? "text-accent" : "text-muted")}
        />
      </div>
      <div className="flex items-baseline gap-3">
        <span
          className={cn(
            "font-numeric text-3xl leading-none",
            emphasis ? "text-accent" : "text-ink"
          )}
        >
          {value}
        </span>
        {delta && (
          <span className="text-[10px] font-numeric text-muted">
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
