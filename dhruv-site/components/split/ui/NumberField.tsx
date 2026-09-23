"use client";

import { useId } from "react";
import clsx from "clsx";
import { minorExponent } from "@/lib/split/currency";

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Controls how many decimal places are accepted, derived from this currency's minor unit. Ignored if `decimals` is set. */
  currency?: string;
  /** Explicit decimal places, for non-money numbers (percentages, shares, exchange rates). Takes priority over `currency`. */
  decimals?: number;
  error?: string;
  placeholder?: string;
  prefix?: string;
  disabled?: boolean;
}

/**
 * A decimal-restricted text input, not a native <input type="number">, so it
 * never silently rounds or shows a spinner. Stays a raw string the caller
 * owns; conversion to minor units happens at the form boundary via toMinor.
 */
export function NumberField({
  label,
  value,
  onChange,
  currency = "CAD",
  decimals: decimalsOverride,
  error,
  placeholder,
  prefix,
  disabled,
}: NumberFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const decimals = decimalsOverride ?? minorExponent(currency);

  const handleChange = (raw: string) => {
    if (raw === "") {
      onChange("");
      return;
    }
    const pattern = decimals === 0 ? /^\d*$/ : new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`);
    if (pattern.test(raw)) onChange(raw);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-rt-ink-muted">
        {label}
      </label>
      <div
        className={clsx(
          "flex h-11 items-center gap-1.5 rounded-lg border bg-rt-surface px-3",
          "focus-within:ring-2 focus-within:ring-rt-ink-strong focus-within:ring-offset-2 focus-within:ring-offset-rt-bg",
          error ? "border-rt-debit" : "border-rt-border"
        )}
      >
        {prefix && <span className="font-mono text-sm text-rt-ink-faint">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          disabled={disabled}
          placeholder={placeholder ?? (decimals === 0 ? "0" : "0.00")}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full bg-transparent font-mono text-sm text-rt-ink-strong placeholder:text-rt-ink-faint outline-none disabled:opacity-50"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      {error && (
        <p id={errorId} className="text-xs text-rt-debit">
          {error}
        </p>
      )}
    </div>
  );
}
