/**
 * Mirrors the shapes the API returns, without importing from lib/split/db
 * (server-only, pulls in the database driver). Kept in sync by hand; the
 * route handler tests are what actually guard the real response shape.
 */
import type { SplitSpec, Minor, MemberId, Transfer } from "@/lib/split";

export interface Member {
  id: MemberId;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  amountMinor: Minor;
  currency: string;
  fxRate: number;
  baseAmountMinor: Minor;
  paidBy: MemberId;
  split: SplitSpec;
  date: string;
  deletedAt: string | null;
  createdBy: MemberId | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface Settlement {
  id: string;
  from: MemberId;
  to: MemberId;
  amountMinor: Minor;
  date: string;
  deletedAt: string | null;
  createdBy: MemberId | null;
  createdAt: string;
}

export interface Balances {
  net: Record<MemberId, Minor>;
  simplified: Transfer[];
  raw: Transfer[];
}

export interface GroupState {
  group: { name: string; baseCurrency: string; createdAt: string };
  members: Member[];
  expenses: Expense[];
  settlements: Settlement[];
  balances: Balances;
  /** Saved default exchange rates by currency, used to prefill new expenses. */
  fxOverrides: Record<string, number>;
}
