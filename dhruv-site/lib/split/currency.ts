import { Minor, SplitError } from "./types";

/** Currencies whose minor unit is not 1/100. */
const EXPONENTS: Record<string, number> = {
  JPY: 0, KRW: 0, VND: 0, CLP: 0, ISK: 0, HUF: 0,
  IDR: 0, TWD: 0, KWD: 3, BHD: 3, OMR: 3, JOD: 3, TND: 3,
};

export function minorExponent(currency: string): number {
  return EXPONENTS[currency.toUpperCase()] ?? 2;
}

export function toMinor(amount: number, currency: string): Minor {
  const factor = 10 ** minorExponent(currency);
  return Math.round(amount * factor);
}

export function fromMinor(minor: Minor, currency: string): number {
  return minor / 10 ** minorExponent(currency);
}

export function formatMoney(minor: Minor, currency: string, locale = "en-CA"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: minorExponent(currency),
  }).format(fromMinor(minor, currency));
}

/**
 * Convert an amount into the group's base currency.
 *
 * `fxRate` is units of base currency per 1 unit of `currency`, captured at the
 * moment the expense was entered and then frozen on the row. Rates are never
 * recomputed later: if they were, every historical balance in the group would
 * drift every day and nobody could reconcile anything.
 *
 * Handles currencies with different minor-unit exponents, so 1000 JPY
 * (exponent 0) converts correctly into CAD cents (exponent 2).
 */
export function convertToBase(
  amountMinor: Minor,
  currency: string,
  baseCurrency: string,
  fxRate: number
): Minor {
  if (!Number.isFinite(fxRate) || fxRate <= 0) {
    throw new SplitError(`fxRate must be a positive number, got ${fxRate}`);
  }
  if (currency.toUpperCase() === baseCurrency.toUpperCase()) {
    if (Math.abs(fxRate - 1) > 1e-9) {
      throw new SplitError("fxRate must be exactly 1 when currency matches the base currency");
    }
    return amountMinor;
  }
  const major = fromMinor(amountMinor, currency) * fxRate;
  return toMinor(major, baseCurrency);
}
