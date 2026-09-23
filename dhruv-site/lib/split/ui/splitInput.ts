/**
 * Client-side reconciliation for the exact/percent split inputs in
 * AddExpenseSheet: turns per-member raw text into a SplitSpec, and produces
 * the "adds up to $60.00" / "$3.50 left to allocate" hint shown under the
 * inputs before the user submits. Mirrors what resolveSplit/cleanSplit
 * already enforce server-side (lib/split/split.ts, lib/split/db/queries.ts),
 * just surfaced earlier so the form gives feedback before the network call.
 */
import type { MemberId, SplitSpec } from "@/lib/split";
import { toMinor } from "@/lib/split";

export interface SplitInputResult {
  spec: SplitSpec | null;
  hint: string;
  ok: boolean;
}

interface Reconciliation {
  ok: boolean;
  hint: string;
}

/**
 * Compares entered amounts against a target (the expense total in minor
 * units for "exact", or 100 for "percent") and decides whether the split is
 * ready to submit, plus a short hint for whichever of the three states it's
 * in. Shared by both modes: the "does this add up, and how do we say so"
 * shape is identical, only the unit (money vs percentage points) differs.
 */
function reconcile(sum: number, target: number, format: (n: number) => string): Reconciliation {
  const diff = sum - target;
  if (Math.abs(diff) < 1e-6) {
    return { ok: true, hint: `Adds up to ${format(target)}` };
  }
  if (diff < 0) {
    return { ok: false, hint: `${format(-diff)} left to allocate` };
  }
  return { ok: false, hint: `${format(diff)} over, remove some` };
}

export function reconcileExactSplit(
  totalMinor: number,
  currency: string,
  perMemberRaw: Record<MemberId, string>
): SplitInputResult {
  const amounts: Record<MemberId, number> = {};
  let sum = 0;
  for (const [id, raw] of Object.entries(perMemberRaw)) {
    const trimmed = raw.trim();
    if (trimmed === "") continue;
    const minor = toMinor(Number(trimmed), currency);
    amounts[id] = minor;
    sum += minor;
  }

  const { ok, hint } = reconcile(sum, totalMinor, (n) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(n / 100)
  );
  return { spec: ok ? { mode: "exact", amounts } : null, hint, ok };
}

export function reconcilePercentSplit(perMemberRaw: Record<MemberId, string>): SplitInputResult {
  const percents: Record<MemberId, number> = {};
  let sum = 0;
  for (const [id, raw] of Object.entries(perMemberRaw)) {
    const trimmed = raw.trim();
    if (trimmed === "") continue;
    const value = Number(trimmed);
    percents[id] = value;
    sum += value;
  }

  const { ok, hint } = reconcile(sum, 100, (n) => `${n.toFixed(1)}%`);
  return { spec: ok ? { mode: "percent", percents } : null, hint, ok };
}
