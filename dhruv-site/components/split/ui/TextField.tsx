"use client";

import { InputHTMLAttributes, useId } from "react";
import clsx from "clsx";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  /** Keeps the label for screen readers without showing it, for repeated rows where it'd be redundant. */
  hideLabel?: boolean;
}

export function TextField({ label, error, hideLabel, className, ...props }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={clsx(
          "text-xs font-mono uppercase tracking-wider text-rt-ink-faint",
          hideLabel && "sr-only"
        )}
      >
        {label}
      </label>
      <input
        id={id}
        className={clsx(
          "h-11 rounded-lg border bg-rt-surface px-3 text-sm text-rt-ink-strong placeholder:text-rt-ink-faint",
          "focus:outline-none focus:ring-2 focus:ring-rt-accent focus:ring-offset-2 focus:ring-offset-rt-bg",
          error ? "border-rt-debit" : "border-rt-border",
          className
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-rt-debit">
          {error}
        </p>
      )}
    </div>
  );
}
