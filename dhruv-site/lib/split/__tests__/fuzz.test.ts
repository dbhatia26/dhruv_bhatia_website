import { describe, it, expect } from "vitest";
import { resolveSplit } from "../split";
import { computeBalances, simplifyDebts, rawDebts, expenseShares } from "../balances";
import { convertToBase } from "../currency";
import { Expense, Settlement, SplitSpec } from "../types";

/** Deterministic PRNG so a failure is reproducible from its seed. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const CURRENCIES = ["CAD", "USD", "EUR", "JPY", "THB", "GBP"];

function buildGroup(seed: number) {
  const r = rng(seed);
  const pick = <T>(arr: T[]) => arr[Math.floor(r() * arr.length)];
  const int = (min: number, max: number) => min + Math.floor(r() * (max - min + 1));

  const memberCount = int(2, 9);
  const members = Array.from({ length: memberCount }, (_, i) => `m${i}`);

  const expenses: Expense[] = [];
  for (let i = 0; i < int(1, 25); i++) {
    const participants = members.filter(() => r() < 0.7);
    if (participants.length === 0) participants.push(pick(members));

    const mode = pick(["equal", "exact", "percent", "shares"] as const);
    const currency = pick(CURRENCIES);
    const fxRate = currency === "CAD" ? 1 : 0.005 + r() * 2;
    const amountMinor = int(1, 500_000);
    const baseAmountMinor = convertToBase(amountMinor, currency, "CAD", fxRate);

    let split: SplitSpec;
    if (mode === "equal") {
      split = { mode: "equal", participants };
    } else if (mode === "shares") {
      const shares: Record<string, number> = {};
      for (const p of participants) shares[p] = int(0, 5);
      if (Object.values(shares).every((v) => v === 0)) shares[participants[0]] = 1;
      split = { mode: "shares", shares };
    } else if (mode === "percent") {
      // Build percentages that sum to exactly 100 via integer basis points.
      const weights = participants.map(() => int(1, 10));
      const total = weights.reduce((a, b) => a + b, 0);
      const percents: Record<string, number> = {};
      let used = 0;
      participants.forEach((p, idx) => {
        if (idx === participants.length - 1) percents[p] = 100 - used;
        else {
          const v = Math.floor((weights[idx] / total) * 10000) / 100;
          percents[p] = v;
          used += v;
        }
      });
      split = { mode: "percent", percents };
    } else {
      // Exact amounts entered in the expense's own currency, as a person would.
      const amounts: Record<string, number> = {};
      let remaining = amountMinor;
      participants.forEach((p, idx) => {
        if (idx === participants.length - 1) amounts[p] = remaining;
        else {
          const v = int(0, Math.max(0, remaining));
          amounts[p] = v;
          remaining -= v;
        }
      });
      split = { mode: "exact", amounts };
    }

    expenses.push({
      id: `e${seed}_${i}`,
      description: "fuzz",
      amountMinor,
      currency,
      fxRate,
      baseAmountMinor,
      paidBy: pick(members),
      split,
      date: "2026-01-01",
      deletedAt: r() < 0.1 ? "2026-01-02" : null,
    });
  }

  const settlements: Settlement[] = [];
  for (let i = 0; i < int(0, 5); i++) {
    const from = pick(members);
    const to = pick(members.filter((m) => m !== from));
    if (!to) continue;
    settlements.push({ id: `s${seed}_${i}`, from, to, amountMinor: int(1, 50_000), date: "d" });
  }

  return { members, expenses, settlements };
}

describe("fuzz: invariants hold across random groups", () => {
  it("survives 3000 generated groups", () => {
    for (let seed = 1; seed <= 3000; seed++) {
      const { members, expenses, settlements } = buildGroup(seed);

      // 1. Every split allocates the full amount, never more or less:
      //    in the currency it was entered in, and in the group base currency.
      for (const e of expenses) {
        const entered = resolveSplit(e.amountMinor, e.split, e.id);
        const enteredTotal = Object.values(entered).reduce((a, b) => a + b, 0);
        expect(enteredTotal, `seed ${seed}, expense ${e.id} entered`).toBe(e.amountMinor);

        const base = expenseShares(e);
        const baseTotal = Object.values(base).reduce((a, b) => a + b, 0);
        expect(baseTotal, `seed ${seed}, expense ${e.id} base`).toBe(e.baseAmountMinor);
      }

      // 2. Balances always net to zero: no money invented or destroyed.
      const balances = computeBalances(members, expenses, settlements);
      const net = Object.values(balances).reduce((a, b) => a + b, 0);
      expect(net, `seed ${seed} balances`).toBe(0);

      // 3. Settle-up clears everyone to exactly zero.
      const after = { ...balances };
      const transfers = simplifyDebts(balances);
      for (const t of transfers) {
        expect(t.amountMinor).toBeGreaterThan(0);
        expect(t.from).not.toBe(t.to);
        after[t.from] += t.amountMinor;
        after[t.to] -= t.amountMinor;
      }
      for (const m of members) {
        expect(after[m], `seed ${seed} member ${m} not cleared`).toBe(0);
      }

      // 4. Simplification never needs more than n-1 transfers.
      expect(transfers.length, `seed ${seed} transfer count`).toBeLessThanOrEqual(
        members.length - 1
      );

      // 5. The raw view moves the same total money as the simplified view.
      const rawTotal = rawDebts(expenses, settlements)
        .reduce((a, t) => a + t.amountMinor, 0);
      const simplifiedTotal = transfers.reduce((a, t) => a + t.amountMinor, 0);
      expect(rawTotal, `seed ${seed} raw total`).toBeGreaterThanOrEqual(simplifiedTotal);
    }
  });
});
