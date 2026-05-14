import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  emphasis?: boolean;
};

export function PrimaryActionCard({
  href,
  eyebrow,
  title,
  description,
  Icon,
  emphasis = false,
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block rounded-themed border border-border-default p-8 transition-colors",
        emphasis
          ? "bg-accent text-canvas hover:bg-accent/90 border-accent"
          : "bg-surface hover:border-accent/60"
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "h-12 w-12 rounded-full grid place-items-center",
            emphasis
              ? "bg-canvas/15 text-canvas"
              : "bg-accent-soft text-accent"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight
          className={cn(
            "h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
            emphasis ? "text-canvas/80" : "text-muted"
          )}
        />
      </div>

      <p
        className={cn(
          "mt-10 text-xs uppercase tracking-[0.18em]",
          emphasis ? "text-canvas/70" : "text-muted"
        )}
      >
        {eyebrow}
      </p>
      <h3
        className={cn(
          "font-display text-3xl leading-tight mt-1",
          emphasis ? "text-canvas" : "text-ink"
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-3 text-sm max-w-sm",
          emphasis ? "text-canvas/80" : "text-muted"
        )}
      >
        {description}
      </p>
    </Link>
  );
}