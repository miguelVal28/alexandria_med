import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
  {
    variants: {
      tone: {
        neutral: "bg-surface text-muted border-border-default",
        accent: "bg-accent-soft text-accent border-accent/30",
        danger: "bg-danger/15 text-danger border-danger/30",
        warn: "bg-warn/15 text-warn border-warn/30",
        ok: "bg-ok/15 text-ok border-ok/30",
        outline: "bg-transparent text-ink border-border-default",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}