"use client";

import { SelectHTMLAttributes, useId } from "react";
import clsx from "clsx";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: string;
  error?: string;
}

export function Select({ label, error, className, children, ...props }: SelectProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-mono uppercase tracking-wider text-rt-ink-faint">
        {label}
      </label>
      <select
        id={id}
        className={clsx(
          "h-11 rounded-lg border bg-rt-surface px-3 text-sm text-rt-ink-strong",
          "focus:outline-none focus:ring-2 focus:ring-rt-accent focus:ring-offset-2 focus:ring-offset-rt-bg",
          error ? "border-rt-debit" : "border-rt-border",
          className
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="text-xs text-rt-debit">
          {error}
        </p>
      )}
    </div>
  );
}
