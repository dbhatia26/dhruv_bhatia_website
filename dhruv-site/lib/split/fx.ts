/**
 * Server-only: fetches ECB exchange rates from Frankfurter. Called from the
 * /api/split/fx route handler, never from client code.
 *
 * Frankfurter covers 30 currencies (checked live against its own
 * /v1/currencies endpoint); some travel currencies are not among them,
 * for example VND, COP and MAD. For those, lib/split/db/queries.ts's
 * setFxOverride lets a group save its own rate instead.
 */
import { SplitError } from "./types";
import { NotFoundError } from "./db";

const FRANKFURTER_BASE = "https://api.frankfurter.dev/v1";
const CURRENCY_RE = /^[A-Za-z]{3}$/;

export interface FxRate {
  from: string;
  to: string;
  rate: number;
  date: string;
}

function cleanCode(raw: string | null, field: string): string {
  if (!raw || !CURRENCY_RE.test(raw)) {
    throw new SplitError(`${field} must be a 3-letter currency code like CAD`);
  }
  return raw.toUpperCase();
}

export function parseFxQuery(searchParams: URLSearchParams): { from: string; to: string } {
  return {
    from: cleanCode(searchParams.get("from"), "from"),
    to: cleanCode(searchParams.get("to"), "to"),
  };
}

export async function getFxRate(from: string, to: string): Promise<FxRate> {
  if (from === to) {
    return { from, to, rate: 1, date: new Date().toISOString().slice(0, 10) };
  }

  // Frankfurter updates once per working day, so a day-long cache means
  // routine expense entry doesn't hit it fresh every time.
  const res = await fetch(`${FRANKFURTER_BASE}/latest?from=${from}&to=${to}`, {
    next: { revalidate: 86_400 },
  });
  if (!res.ok) {
    throw new NotFoundError(`No exchange rate available for ${from} to ${to}`);
  }

  const body = (await res.json()) as { rates?: Record<string, number>; date?: string };
  const rate = body.rates?.[to];
  if (typeof rate !== "number") {
    throw new NotFoundError(`No exchange rate available for ${from} to ${to}`);
  }

  return { from, to, rate, date: body.date ?? new Date().toISOString().slice(0, 10) };
}
