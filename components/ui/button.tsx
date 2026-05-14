"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-canvas hover:opacity-90 shadow-soft",
        secondary:
          "bg-surface text-ink border border-border-default hover:border-accent/60",
        ghost: "text-ink hover:bg-surface",
        outline:
          "border border-border-default text-ink hover:border-accent/60 hover:text-accent",
        danger: "bg-danger text-canvas hover:opacity-90",
        link: "text-accent hover:underline underline-offset-4",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-md",
        md: "h-10 px-4 text-sm rounded-themed",
        lg: "h-12 px-6 text-base rounded-themed",
        icon: "h-9 w-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };