/**
 * All monetary values are integer minor units (cents, satang, yen).
 * Floats never touch money in this codebase.
 */
export type Minor = number;

export type MemberId = string;

export type SplitMode = "equal" | "exact" | "percent" | "shares";

/** How an expense divides among its participants. */
export type SplitSpec =
  | { mode: "equal"; participants: MemberId[] }
  /** Explicit minor-unit amount per member. Must sum to the expense total. */
  | { mode: "exact"; amounts: Record<MemberId, Minor> }
  /** Percentages as numbers, e.g. 33.5. Must sum to 100. */
  | { mode: "percent"; percents: Record<MemberId, number> }
  /** Relative weights, e.g. { alice: 2, bob: 1 }. Must be positive. */
  | { mode: "shares"; shares: Record<MemberId, number> };

export interface Expense {
  id: string;
  description: string;
  /** Amount in the expense's own currency. */
  amountMinor: Minor;
  currency: string;
  /**
   * Units of group base currency per 1 unit of `currency`, frozen at entry.
   * 1 when currency === group base currency.
   */
  fxRate: number;
  /** Amount converted to group base currency, computed once and stored. */
  baseAmountMinor: Minor;
  paidBy: MemberId;
  split: SplitSpec;
  date: string;
  deletedAt?: string | null;
}

/** A real-world cash transfer that settles debt. */
export interface Settlement {
  id: string;
  from: MemberId;
  to: MemberId;
  amountMinor: Minor;
  date: string;
  deletedAt?: string | null;
}

export interface Transfer {
  from: MemberId;
  to: MemberId;
  amountMinor: Minor;
}

export class SplitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SplitError";
  }
}
