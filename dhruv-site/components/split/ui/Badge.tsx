import { HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "neutral" | "credit" | "debit" | "warn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral: "border-rt-border bg-rt-surface text-rt-ink-muted",
  credit: "border-rt-credit-border bg-rt-credit-soft text-rt-credit",
  debit: "border-rt-debit-border bg-rt-debit-soft text-rt-debit",
  warn: "border-rt-warn-border bg-rt-warn-soft text-rt-warn",
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
