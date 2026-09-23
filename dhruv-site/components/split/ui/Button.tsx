"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  // bg-rt-ink-strong / text-rt-bg flips automatically with the theme: near-black
  // fill with light text in light mode, near-white fill with dark text in dark
  // mode, since --rt-ink-strong and --rt-bg both flip. No accent color needed.
  primary: "bg-rt-ink-strong text-rt-bg hover:opacity-90 focus-visible:ring-rt-ink-strong",
  secondary:
    "bg-rt-surface text-rt-ink-strong border border-rt-border hover:bg-rt-surface-raised focus-visible:ring-rt-ink-strong",
  ghost: "bg-transparent text-rt-ink-muted hover:text-rt-ink-strong focus-visible:ring-rt-ink-strong",
  danger:
    "bg-rt-debit-soft text-rt-debit border border-rt-debit-border hover:bg-rt-debit-soft-hover focus-visible:ring-rt-debit",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "min-w-11 disabled:opacity-50 disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-rt-bg",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
