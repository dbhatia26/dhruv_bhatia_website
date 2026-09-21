import { describe, it, expect } from "vitest";
import { allocate } from "../allocate";
import { resolveSplit } from "../split";
import { convertToBase, toMinor, minorExponent } from "../currency";
import { computeBalances, simplifyDebts, rawDebts } from "../balances";
import { Expense, Settlement, SplitError } from "../types";

const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

const expense = (e: Partial<Expense> & Pick<Expense, "id" | "paidBy" | "split">): Expense => ({
  description: "test",
  amountMinor: e.baseAmountMinor ?? 0,
  currency: "CAD",
  fxRate: 1,
  baseAmountMinor: 0,
  date: "2026-01-01",
  ...e,
});

describe("allocate", () => {
  it("splits an indivisible amount so the parts still sum exactly", () => {
    const r = allocate(1000, { a: 1, b: 1, c: 1 }, "x");
    expect(sum(r)).toBe(1000);
    expect(Object.values(r).sort()).toEqual([333, 333, 334]);
  });

  it("rotates the leftover cent across different expenses", () => {
    const winners = new Set<string>();
    for (const seed of ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8"]) {
      const r = allocate(1000, { alice: 1, bob: 1, carol: 1 }, seed);
      winners.add(Object.keys(r).find((k) => r[k] === 334)!);
    }
    // Without rotation this set would only ever contain "alice".
    expect(winners.size).toBeGreaterThan(1);
  });

  it("is deterministic for the same seed", () => {
    expect(allocate(1000, { a: 1, b: 1, c: 1 }, "same")).toEqual(
      allocate(1000, { a: 1, b: 1, c: 1 }, "same")
    );
  });

  it("handles a refund without losing a unit", () => {
    const r = allocate(-1000, { a: 1, b: 1, c: 1 }, "x");
    expect(sum(r)).toBe(-1000);
  });

  it("gives everything to a single member", () => {
    expect(allocate(777, { solo: 1 }, "x")).toEqual({ solo: 777 });
  });

  it("handles a zero total", () => {
    expect(sum(allocate(0, { a: 1, b: 1 }, "x"))).toBe(0);
  });

  it("rejects weights that sum to zero", () => {
    expect(() => allocate(100, { a: 0, b: 0 }, "x")).toThrow(SplitError);
  });

  it("keeps large splits exact", () => {
    const weights = Object.fromEntries(
      Array.from({ length: 17 }, (_, i) => [`m${i}`, 1])
    );
    const r = allocate(100_000, weights, "big");
    expect(sum(r)).toBe(100_000);
  });
});

describe("resolveSplit", () => {
  it("splits equally and ignores duplicate participants", () => {
    const r = resolveSplit(900, { mode: "equal", participants: ["a", "b", "a"] }, "e");
    expect(r).toEqual({ a: 450, b: 450 });
  });

  it("accepts exact amounts that reconcile", () => {
    const r = resolveSplit(1000, { mode: "exact", amounts: { a: 600, b: 400 } }, "e");
    expect(r).toEqual({ a: 600, b: 400 });
  });

  it("rejects exact amounts that do not reconcile", () => {
    expect(() =>
      resolveSplit(1000, { mode: "exact", amounts: { a: 600, b: 300 } }, "e")
    ).toThrow(/sum to 900/);
  });

  it("handles percentages that cannot divide cleanly", () => {
    const r = resolveSplit(
      10_000,
      { mode: "percent", percents: { a: 33.33, b: 33.33, c: 33.34 } },
      "e"
    );
    expect(sum(r)).toBe(10_000);
  });

  it("rejects percentages that miss 100", () => {
    expect(() =>
      resolveSplit(1000, { mode: "percent", percents: { a: 50, b: 30 } }, "e")
    ).toThrow(/expected 100/);
  });

  it("weights a shared room correctly", () => {
    // Two people share a double, one person is solo: 2:1.
    const r = resolveSplit(30_000, { mode: "shares", shares: { couple: 2, solo: 1 } }, "e");
    expect(r).toEqual({ couple: 20_000, solo: 10_000 });
  });

  it("supports a member with a zero share", () => {
    const r = resolveSplit(1000, { mode: "shares", shares: { a: 1, b: 1, kid: 0 } }, "e");
    expect(r.kid).toBe(0);
    expect(sum(r)).toBe(1000);
  });
});

describe("currency", () => {
  it("knows which currencies have no minor unit", () => {
    expect(minorExponent("JPY")).toBe(0);
    expect(minorExponent("CAD")).toBe(2);
    expect(minorExponent("KWD")).toBe(3);
  });

  it("converts across differing minor-unit exponents", () => {
    // 10,000 JPY at 0.0092 CAD per JPY = 92.00 CAD = 9200 cents.
    expect(convertToBase(10_000, "JPY", "CAD", 0.0092)).toBe(9200);
  });

  it("converts THB to CAD", () => {
    // 2400.00 THB at 0.0405 = 97.20 CAD.
    expect(convertToBase(toMinor(2400, "THB"), "THB", "CAD", 0.0405)).toBe(9720);
  });

  it("passes through when currencies match", () => {
    expect(convertToBase(5000, "CAD", "CAD", 1)).toBe(5000);
  });

  it("rejects a non-unit rate on a same-currency expense", () => {
    expect(() => convertToBase(5000, "CAD", "CAD", 1.2)).toThrow(SplitError);
  });

  it("rejects a non-positive rate", () => {
    expect(() => convertToBase(5000, "USD", "CAD", 0)).toThrow(SplitError);
  });
});

describe("balances", () => {
  const members = ["alice", "bob", "carol"];

  it("always nets to zero", () => {
    const expenses = [
      expense({ id: "e1", paidBy: "alice", baseAmountMinor: 9000,
        split: { mode: "equal", participants: members } }),
      expense({ id: "e2", paidBy: "bob", baseAmountMinor: 4501,
        split: { mode: "equal", participants: members } }),
    ];
    expect(sum(computeBalances(members, expenses, []))).toBe(0);
  });

  it("handles an expense the payer is not part of", () => {
    // Alice buys Bob and Carol dinner but does not eat.
    const expenses = [
      expense({ id: "e1", paidBy: "alice", baseAmountMinor: 6000,
        split: { mode: "equal", participants: ["bob", "carol"] } }),
    ];
    const b = computeBalances(members, expenses, []);
    expect(b).toEqual({ alice: 6000, bob: -3000, carol: -3000 });
  });

  it("ignores soft-deleted expenses", () => {
    const expenses = [
      expense({ id: "e1", paidBy: "alice", baseAmountMinor: 9000,
        split: { mode: "equal", participants: members } }),
      expense({ id: "e2", paidBy: "bob", baseAmountMinor: 9000, deletedAt: "2026-01-02",
        split: { mode: "equal", participants: members } }),
    ];
    const b = computeBalances(members, expenses, []);
    expect(b.alice).toBe(6000);
    expect(b.bob).toBe(-3000);
  });

  it("applies a partial settlement", () => {
    const expenses = [
      expense({ id: "e1", paidBy: "alice", baseAmountMinor: 10_000,
        split: { mode: "equal", participants: ["alice", "bob"] } }),
    ];
    const settlements: Settlement[] = [
      { id: "s1", from: "bob", to: "alice", amountMinor: 2000, date: "2026-01-02" },
    ];
    const b = computeBalances(["alice", "bob"], expenses, settlements);
    expect(b).toEqual({ alice: 3000, bob: -3000 });
  });

  it("leaves everyone at zero when one person pays for everything and is repaid", () => {
    const expenses = [
      expense({ id: "e1", paidBy: "alice", baseAmountMinor: 9000,
        split: { mode: "equal", participants: members } }),
    ];
    const settlements: Settlement[] = [
      { id: "s1", from: "bob", to: "alice", amountMinor: 3000, date: "d" },
      { id: "s2", from: "carol", to: "alice", amountMinor: 3000, date: "d" },
    ];
    const b = computeBalances(members, expenses, settlements);
    expect(b).toEqual({ alice: 0, bob: 0, carol: 0 });
  });

  it("ignores soft-deleted settlements", () => {
    const expenses = [
      expense({ id: "e1", paidBy: "alice", baseAmountMinor: 10_000,
        split: { mode: "equal", participants: ["alice", "bob"] } }),
    ];
    const settlements: Settlement[] = [
      { id: "s1", from: "bob", to: "alice", amountMinor: 5000, date: "d", deletedAt: "2026-01-03" },
    ];
    expect(computeBalances(["alice", "bob"], expenses, settlements)).toEqual({ alice: 5000, bob: -5000 });
    expect(rawDebts(expenses, settlements)).toEqual([{ from: "bob", to: "alice", amountMinor: 5000 }]);
  });

  it("reports zero for a member who never transacted", () => {
    const b = computeBalances(["alice", "ghost"], [], []);
    expect(b.ghost).toBe(0);
  });
});

describe("exact splits in a foreign currency", () => {
  it("converts exact amounts entered in the expense currency", () => {
    // 2,400 THB dinner, split 1,000 / 1,400 THB, converted at 0.0405.
    const e = expense({
      id: "thb1", paidBy: "alice", currency: "THB", fxRate: 0.0405,
      amountMinor: 240_000, baseAmountMinor: 9720,
      split: { mode: "exact", amounts: { alice: 100_000, bob: 140_000 } },
    });
    const b = computeBalances(["alice", "bob"], [e], []);
    expect(sum(b)).toBe(0);
    // Bob had 1,400 of 2,400 THB, so 7/12 of 97.20 CAD = 56.70 CAD.
    expect(b.bob).toBe(-5670);
    expect(rawDebts([e], [])).toEqual([{ from: "bob", to: "alice", amountMinor: 5670 }]);
  });

  it("reproduces exact amounts to the cent in the base currency", () => {
    const e = expense({
      id: "cad1", paidBy: "alice", baseAmountMinor: 10_001,
      split: { mode: "exact", amounts: { alice: 3_333, bob: 6_668 } },
    });
    expect(computeBalances(["alice", "bob"], [e], [])).toEqual({ alice: 6_668, bob: -6_668 });
  });
});

describe("simplifyDebts", () => {
  const applyTransfers = (
    balances: Record<string, number>,
    transfers: { from: string; to: string; amountMinor: number }[]
  ) => {
    const after = { ...balances };
    for (const t of transfers) {
      after[t.from] += t.amountMinor;
      after[t.to] -= t.amountMinor;
    }
    return after;
  };

  it("clears everyone to zero", () => {
    const balances = { a: 5000, b: -3000, c: -2000 };
    const after = applyTransfers(balances, simplifyDebts(balances));
    expect(Object.values(after).every((v) => v === 0)).toBe(true);
  });

  it("uses at most n-1 transfers for a five-person group", () => {
    const balances = { a: 7500, b: 2500, c: -1000, d: -4000, e: -5000 };
    const transfers = simplifyDebts(balances);
    expect(transfers.length).toBeLessThanOrEqual(4);
    const after = applyTransfers(balances, transfers);
    expect(Object.values(after).every((v) => v === 0)).toBe(true);
  });

  it("returns nothing when everyone is already square", () => {
    expect(simplifyDebts({ a: 0, b: 0, c: 0 })).toEqual([]);
  });

  it("produces a single transfer for a two-person group", () => {
    expect(simplifyDebts({ a: 2500, b: -2500 })).toEqual([
      { from: "b", to: "a", amountMinor: 2500 },
    ]);
  });

  it("never emits a zero-value transfer", () => {
    const balances = { a: 1000, b: 0, c: -1000 };
    expect(simplifyDebts(balances).every((t) => t.amountMinor > 0)).toBe(true);
  });

  it("clears a realistic eight-person trip", () => {
    const members = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const expenses: Expense[] = [
      expense({ id: "x1", paidBy: "a", baseAmountMinor: 132_455,
        split: { mode: "equal", participants: members } }),
      expense({ id: "x2", paidBy: "c", baseAmountMinor: 47_333,
        split: { mode: "equal", participants: ["c", "d", "e"] } }),
      expense({ id: "x3", paidBy: "f", baseAmountMinor: 8_999,
        split: { mode: "shares", shares: { f: 2, g: 1, h: 1 } } }),
      expense({ id: "x4", paidBy: "b", baseAmountMinor: 21_001,
        split: { mode: "percent", percents: { a: 25, b: 25, c: 25, d: 25 } } }),
    ];
    const balances = computeBalances(members, expenses, []);
    expect(sum(balances)).toBe(0);
    const transfers = simplifyDebts(balances);
    expect(transfers.length).toBeLessThanOrEqual(members.length - 1);
    const after = applyTransfers(balances, transfers);
    expect(Object.values(after).every((v) => v === 0)).toBe(true);
  });
});

describe("rawDebts", () => {
  it("nets opposing debts between the same pair", () => {
    const expenses = [
      expense({ id: "e1", paidBy: "alice", baseAmountMinor: 10_000,
        split: { mode: "equal", participants: ["alice", "bob"] } }),
      expense({ id: "e2", paidBy: "bob", baseAmountMinor: 6000,
        split: { mode: "equal", participants: ["alice", "bob"] } }),
    ];
    // Bob owes 5000, Alice owes 3000, so one 2000 transfer remains.
    expect(rawDebts(expenses, [])).toEqual([
      { from: "bob", to: "alice", amountMinor: 2000 },
    ]);
  });

  it("keeps debts to separate people separate", () => {
    const expenses = [
      expense({ id: "e1", paidBy: "alice", baseAmountMinor: 4000,
        split: { mode: "equal", participants: ["alice", "carol"] } }),
      expense({ id: "e2", paidBy: "bob", baseAmountMinor: 4000,
        split: { mode: "equal", participants: ["bob", "carol"] } }),
    ];
    // Simplification might reroute these; raw view must not.
    expect(rawDebts(expenses, [])).toHaveLength(2);
  });

  it("clears a pair once settled", () => {
    const expenses = [
      expense({ id: "e1", paidBy: "alice", baseAmountMinor: 10_000,
        split: { mode: "equal", participants: ["alice", "bob"] } }),
    ];
    const settlements: Settlement[] = [
      { id: "s1", from: "bob", to: "alice", amountMinor: 5000, date: "d" },
    ];
    expect(rawDebts(expenses, settlements)).toEqual([]);
  });
});
