import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex w-full min-h-[100px] rounded-themed border border-border-default bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 resize-y",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";