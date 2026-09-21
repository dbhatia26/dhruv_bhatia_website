import { resolveSplit } from "./split";
import { Expense, MemberId, Minor, Settlement, SplitSpec, Transfer } from "./types";

/**
 * Exact split amounts are entered in the expense's own currency (a 2,400 THB
 * dinner split 1,000 / 1,400 THB), but balances are computed in the group's
 * base currency. Converting each amount separately would round them so they
 * no longer sum to the converted total.
 *
 * Treating them as proportional shares of the base amount fixes this: in the
 * same currency it reproduces the entered amounts exactly, and in a foreign
 * currency the parts still sum to the base total to the cent.
 */
export function splitForBase(e: Expense): SplitSpec {
  if (e.split.mode === "exact") {
    return { mode: "shares", shares: { ...e.split.amounts } };
  }
  return e.split;
}

/** Each member's share of one expense, in group base currency. */
export function expenseShares(e: Expense): Record<MemberId, Minor> {
  return resolveSplit(e.baseAmountMinor, splitForBase(e), e.id);
}

/**
 * Net position per member, in group base currency minor units.
 * Positive means the group owes them. Negative means they owe the group.
 * The values always sum to zero.
 */
export function computeBalances(
  memberIds: MemberId[],
  expenses: Expense[],
  settlements: Settlement[]
): Record<MemberId, Minor> {
  const balances: Record<MemberId, Minor> = {};
  for (const id of memberIds) balances[id] = 0;

  const bump = (id: MemberId, delta: Minor) => {
    balances[id] = (balances[id] ?? 0) + delta;
  };

  for (const e of expenses) {
    if (e.deletedAt) continue;
    bump(e.paidBy, e.baseAmountMinor);
    const shares = expenseShares(e);
    for (const [id, share] of Object.entries(shares)) bump(id, -share);
  }

  // Paying cash moves you toward zero from below; receiving moves you down.
  for (const s of settlements) {
    if (s.deletedAt) continue;
    bump(s.from, s.amountMinor);
    bump(s.to, -s.amountMinor);
  }

  return balances;
}

/**
 * Minimise the number of transfers needed to clear all debts.
 *
 * Greedy largest-creditor against largest-debtor. The provably minimal version
 * of this problem is NP-hard, but greedy lands on n-1 transfers or better in
 * essentially every real group, and is always correct (everyone ends at zero).
 *
 * The tradeoff is social, not mathematical: this can tell you to pay someone
 * you never shared an expense with. Pair it with `rawDebts` in the UI.
 */
export function simplifyDebts(balances: Record<MemberId, Minor>): Transfer[] {
  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 0)
    .map(([id, v]) => ({ id, amount: v }));
  const debtors = Object.entries(balances)
    .filter(([, v]) => v < 0)
    .map(([id, v]) => ({ id, amount: -v }));

  // Sort by size, then id, so output is stable across runs.
  const bySize = (a: { id: string; amount: number }, b: { id: string; amount: number }) =>
    b.amount - a.amount || a.id.localeCompare(b.id);
  creditors.sort(bySize);
  debtors.sort(bySize);

  const transfers: Transfer[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debt = debtors[di];
    const amount = Math.min(credit.amount, debt.amount);

    if (amount > 0) {
      transfers.push({ from: debt.id, to: credit.id, amountMinor: amount });
    }

    credit.amount -= amount;
    debt.amount -= amount;
    if (credit.amount === 0) ci++;
    if (debt.amount === 0) di++;
  }

  return transfers;
}

/**
 * Who owes whom based on actual shared expenses, netted per pair.
 * Slower to settle but easier to argue with, which is sometimes the point.
 */
export function rawDebts(expenses: Expense[], settlements: Settlement[]): Transfer[] {
  const pairs = new Map<string, Minor>();

  const key = (a: MemberId, b: MemberId) => `${a}\u0000${b}`;

  const owe = (debtor: MemberId, creditor: MemberId, amount: Minor) => {
    if (debtor === creditor || amount === 0) return;
    // Store each pair in one canonical direction so opposing debts cancel.
    const [x, y] = debtor < creditor ? [debtor, creditor] : [creditor, debtor];
    const signed = debtor < creditor ? amount : -amount;
    pairs.set(key(x, y), (pairs.get(key(x, y)) ?? 0) + signed);
  };

  for (const e of expenses) {
    if (e.deletedAt) continue;
    for (const [id, share] of Object.entries(expenseShares(e))) owe(id, e.paidBy, share);
  }

  for (const s of settlements) {
    if (s.deletedAt) continue;
    owe(s.to, s.from, s.amountMinor);
  }

  const transfers: Transfer[] = [];
  for (const [k, net] of pairs) {
    if (net === 0) continue;
    const [x, y] = k.split("\u0000");
    transfers.push(
      net > 0
        ? { from: x, to: y, amountMinor: net }
        : { from: y, to: x, amountMinor: -net }
    );
  }

  return transfers.sort(
    (a, b) => b.amountMinor - a.amountMinor || a.from.localeCompare(b.from)
  );
}
