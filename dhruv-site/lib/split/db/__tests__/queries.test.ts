import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { schema } from "../schema";
import type { SplitDb } from "../client";
import {
  createGroup, loadGroup, addMember, renameMember,
  addExpense, updateExpense, deleteExpense, restoreExpense,
  addSettlement, deleteSettlement, setFxOverride, NotFoundError, type ExpenseInput,
} from "../queries";
import { computeBalances, simplifyDebts } from "../../balances";
import { toMinor } from "../../currency";
import { SplitError } from "../../types";

let db: SplitDb;

beforeAll(async () => {
  const client = new PGlite();
  const pg = drizzle(client, { schema });
  // The same migration files that get applied to Neon.
  await migrate(pg, { migrationsFolder: "./drizzle" });
  db = pg as unknown as SplitDb;
}, 30_000);

const today = "2026-03-01";

async function trip(names = ["Asha", "Ben", "Chen"], baseCurrency = "CAD") {
  const g = await createGroup(db, { name: "Test trip", baseCurrency, memberNames: names });
  const id = (n: string) => g.members.find((m) => m.name === n)!.id;
  return { ...g, id };
}

function dinner(paidBy: string, participants: string[], over: Partial<ExpenseInput> = {}): ExpenseInput {
  return {
    description: "Dinner", amountMinor: 9000, currency: "CAD", fxRate: 1,
    paidBy, split: { mode: "equal", participants }, date: today, ...over,
  };
}

async function balancesOf(secret: string) {
  const s = await loadGroup(db, secret);
  return computeBalances(s.members.map((m) => m.id), s.expenses, s.settlements);
}

describe("groups", () => {
  it("creates a group and loads it back by secret", async () => {
    const { secret, members } = await trip();
    expect(secret).toMatch(/^[A-Za-z0-9_-]{21}$/);
    const s = await loadGroup(db, secret);
    expect(s.group.name).toBe("Test trip");
    expect(s.group.baseCurrency).toBe("CAD");
    expect(s.members.map((m) => m.name)).toEqual(["Asha", "Ben", "Chen"]);
    expect(members).toHaveLength(3);
  });

  it("normalises the currency code", async () => {
    const g = await createGroup(db, { name: "x", baseCurrency: "usd", memberNames: ["A"] });
    expect((await loadGroup(db, g.secret)).group.baseCurrency).toBe("USD");
  });

  it("rejects a bad currency, no people, and duplicate names in any case", async () => {
    await expect(createGroup(db, { name: "x", baseCurrency: "DOLLARS", memberNames: ["A"] }))
      .rejects.toThrow(SplitError);
    await expect(createGroup(db, { name: "x", baseCurrency: "CAD", memberNames: [] }))
      .rejects.toThrow(/at least one/);
    await expect(createGroup(db, { name: "x", baseCurrency: "CAD", memberNames: ["Sam", "sam "] }))
      .rejects.toThrow(/different name/);
  });

  it("returns not found for an unknown or malformed secret", async () => {
    await expect(loadGroup(db, "AAAAAAAAAAAAAAAAAAAAA")).rejects.toThrow(NotFoundError);
    await expect(loadGroup(db, "'; drop table x; --")).rejects.toThrow(NotFoundError);
    await expect(loadGroup(db, "")).rejects.toThrow(NotFoundError);
  });
});

describe("members", () => {
  it("adds and renames members", async () => {
    const t = await trip();
    const dev = await addMember(db, t.secret, "  Dev  ");
    expect(dev.name).toBe("Dev");
    await renameMember(db, t.secret, dev.id, "Devika");
    const s = await loadGroup(db, t.secret);
    expect(s.members.map((m) => m.name)).toContain("Devika");
  });

  it("enforces case-insensitive unique names at the database level", async () => {
    const t = await trip();
    await expect(addMember(db, t.secret, "asha")).rejects.toThrow(/already has that name/);
    await expect(renameMember(db, t.secret, t.id("Ben"), "ASHA")).rejects.toThrow(/already has that name/);
  });

  it("allows the same name in two different groups", async () => {
    await trip(["Sam"]);
    await expect(trip(["Sam"])).resolves.toBeDefined();
  });
});

describe("expenses", () => {
  it("stores an expense and nets balances to zero", async () => {
    const t = await trip();
    await addExpense(db, t.secret, dinner(t.id("Asha"), [t.id("Asha"), t.id("Ben"), t.id("Chen")]));
    const b = await balancesOf(t.secret);
    expect(b[t.id("Asha")]).toBe(6000);
    expect(Object.values(b).reduce((x, y) => x + y, 0)).toBe(0);
  });

  it("freezes the converted amount for a foreign currency", async () => {
    const t = await trip();
    const e = await addExpense(db, t.secret, dinner(t.id("Asha"), [t.id("Asha"), t.id("Ben")], {
      amountMinor: toMinor(2400, "THB"), currency: "THB", fxRate: 0.0405,
    }));
    expect(e.baseAmountMinor).toBe(9720);
    const s = await loadGroup(db, t.secret);
    expect(s.expenses[0].baseAmountMinor).toBe(9720);
    expect(s.expenses[0].fxRate).toBe(0.0405);
  });

  it("handles an exact split entered in a foreign currency end to end", async () => {
    const t = await trip();
    await addExpense(db, t.secret, dinner(t.id("Asha"), [], {
      amountMinor: 240_000, currency: "THB", fxRate: 0.0405,
      split: { mode: "exact", amounts: { [t.id("Asha")]: 100_000, [t.id("Ben")]: 140_000 } },
    }));
    const b = await balancesOf(t.secret);
    expect(b[t.id("Ben")]).toBe(-5670);
    expect(b[t.id("Asha")]).toBe(5670);
  });

  it("handles zero-decimal currencies", async () => {
    const t = await trip();
    const e = await addExpense(db, t.secret, dinner(t.id("Asha"), [t.id("Asha"), t.id("Ben")], {
      amountMinor: 10_000, currency: "JPY", fxRate: 0.0092,
    }));
    expect(e.baseAmountMinor).toBe(9200);
  });

  it("rejects invalid expenses before they reach the database", async () => {
    const t = await trip();
    const a = t.id("Asha");
    const bad: Partial<ExpenseInput>[] = [
      { description: "   " },
      { amountMinor: 0 },
      { amountMinor: 12.5 },
      { currency: "C$" },
      { fxRate: 1.3 }, // CAD group, CAD expense, rate must be 1
      { currency: "USD", fxRate: 0 },
      { date: "2026-02-30" },
      { date: "March 1" },
      { split: { mode: "exact", amounts: { [a]: 1000 } } }, // does not reconcile
      { split: { mode: "percent", percents: { [a]: 60 } } },
      { split: { mode: "equal", participants: [] } },
    ];
    for (const over of bad) {
      await expect(addExpense(db, t.secret, dinner(a, [a], over)), JSON.stringify(over))
        .rejects.toThrow(SplitError);
    }
    expect((await loadGroup(db, t.secret)).expenses).toHaveLength(0);
  });

  it("drops unknown fields from the stored split", async () => {
    const t = await trip();
    const a = t.id("Asha");
    await addExpense(db, t.secret, dinner(a, [a], {
      split: { mode: "equal", participants: [a, a], evil: "<script>" } as never,
    }));
    const s = await loadGroup(db, t.secret);
    expect(s.expenses[0].split).toEqual({ mode: "equal", participants: [a] });
  });

  it("updates an expense and recomputes the base amount", async () => {
    const t = await trip();
    const a = t.id("Asha"), b = t.id("Ben");
    const e = await addExpense(db, t.secret, dinner(a, [a, b]));
    const u = await updateExpense(db, t.secret, e.id, dinner(a, [a, b], {
      amountMinor: 5000, currency: "USD", fxRate: 1.37, description: "Lunch",
    }));
    expect(u.baseAmountMinor).toBe(6850);
    expect(u.description).toBe("Lunch");
    expect(u.updatedAt).not.toBeNull();
    expect(u.createdAt).toBe(e.createdAt);
  });

  it("soft deletes and restores, keeping history", async () => {
    const t = await trip();
    const a = t.id("Asha"), b = t.id("Ben");
    const e = await addExpense(db, t.secret, dinner(a, [a, b]));

    await deleteExpense(db, t.secret, e.id);
    let s = await loadGroup(db, t.secret);
    expect(s.expenses).toHaveLength(1);
    expect(s.expenses[0].deletedAt).not.toBeNull();
    expect((await balancesOf(t.secret))[a]).toBe(0);

    await expect(updateExpense(db, t.secret, e.id, dinner(a, [a, b]))).rejects.toThrow(NotFoundError);

    await restoreExpense(db, t.secret, e.id);
    s = await loadGroup(db, t.secret);
    expect(s.expenses[0].deletedAt).toBeNull();
    expect((await balancesOf(t.secret))[a]).toBe(4500);
  });

  it("returns not found for a malformed expense id instead of a server error", async () => {
    const t = await trip();
    await expect(deleteExpense(db, t.secret, "abc")).rejects.toThrow(NotFoundError);
    await expect(deleteExpense(db, t.secret, "00000000-0000-0000-0000-000000000000"))
      .rejects.toThrow(NotFoundError);
  });

  it("keeps many rapid inserts without losing any", async () => {
    // PGlite runs one connection, so this checks the write path rather than
    // true parallelism. Real concurrency safety comes from one row per expense.
    const t = await trip();
    const a = t.id("Asha"), b = t.id("Ben");
    await Promise.all(
      Array.from({ length: 25 }, (_, i) =>
        addExpense(db, t.secret, dinner(a, [a, b], { description: `Item ${i}`, amountMinor: 100 + i }))
      )
    );
    const s = await loadGroup(db, t.secret);
    expect(s.expenses).toHaveLength(25);
    const expected = Array.from({ length: 25 }, (_, i) => 100 + i).reduce((x, y) => x + y, 0);
    expect(s.expenses.reduce((x, e) => x + e.baseAmountMinor, 0)).toBe(expected);
  });
});

describe("isolation between groups", () => {
  it("cannot reference another group's members", async () => {
    const mine = await trip();
    const theirs = await trip(["Xavi", "Yara"]);
    const a = mine.id("Asha");
    const x = theirs.id("Xavi");

    await expect(addExpense(db, mine.secret, dinner(x, [a]))).rejects.toThrow(/not in this group/);
    await expect(addExpense(db, mine.secret, dinner(a, [a, x]))).rejects.toThrow(/not in this group/);
    await expect(addExpense(db, mine.secret, dinner(a, [a], { createdBy: x }))).rejects.toThrow(/not in this group/);
    await expect(addSettlement(db, mine.secret, { from: a, to: x, amountMinor: 100, date: today }))
      .rejects.toThrow(/not in this group/);
  });

  it("cannot edit, delete or restore another group's expense with its own link", async () => {
    const mine = await trip();
    const theirs = await trip(["Xavi", "Yara"]);
    const x = theirs.id("Xavi"), y = theirs.id("Yara");
    const e = await addExpense(db, theirs.secret, dinner(x, [x, y]));

    await expect(deleteExpense(db, mine.secret, e.id)).rejects.toThrow(NotFoundError);
    await expect(restoreExpense(db, mine.secret, e.id)).rejects.toThrow(NotFoundError);
    await expect(updateExpense(db, mine.secret, e.id, dinner(mine.id("Asha"), [mine.id("Asha")])))
      .rejects.toThrow(NotFoundError);
    await expect(renameMember(db, mine.secret, x, "Hacked")).rejects.toThrow(NotFoundError);

    const s = await loadGroup(db, theirs.secret);
    expect(s.expenses[0].deletedAt).toBeNull();
    expect(s.expenses[0].description).toBe("Dinner");
    expect(s.members.map((m) => m.name)).toEqual(["Xavi", "Yara"]);
  });

  it("never leaks another group's data into a load", async () => {
    const mine = await trip();
    const theirs = await trip(["Xavi", "Yara"]);
    await addExpense(db, theirs.secret, dinner(theirs.id("Xavi"), [theirs.id("Yara")]));
    const s = await loadGroup(db, mine.secret);
    expect(s.expenses).toHaveLength(0);
    expect(s.members.map((m) => m.name)).not.toContain("Xavi");
  });
});

describe("settlements", () => {
  it("settles up to exactly zero using the simplified plan", async () => {
    const t = await trip(["Asha", "Ben", "Chen", "Dee"]);
    const [a, b, c, d] = ["Asha", "Ben", "Chen", "Dee"].map(t.id);
    await addExpense(db, t.secret, dinner(a, [a, b, c, d], { amountMinor: 252_080 }));
    await addExpense(db, t.secret, dinner(b, [a, b, c, d], {
      amountMinor: 240_000, currency: "THB", fxRate: 0.0405,
    }));
    await addExpense(db, t.secret, dinner(c, [a, b, c], { amountMinor: 57_540, split: {
      mode: "shares", shares: { [a]: 1, [b]: 1, [c]: 1 },
    } }));

    for (const tr of simplifyDebts(await balancesOf(t.secret))) {
      await addSettlement(db, t.secret, { from: tr.from, to: tr.to, amountMinor: tr.amountMinor, date: today });
    }
    const after = await balancesOf(t.secret);
    expect(Object.values(after).every((v) => v === 0)).toBe(true);
  });

  it("restores the debt when a settlement is deleted", async () => {
    const t = await trip();
    const a = t.id("Asha"), b = t.id("Ben");
    await addExpense(db, t.secret, dinner(a, [a, b]));
    const s = await addSettlement(db, t.secret, { from: b, to: a, amountMinor: 4500, date: today });
    expect((await balancesOf(t.secret))[a]).toBe(0);
    await deleteSettlement(db, t.secret, s.id);
    expect((await balancesOf(t.secret))[a]).toBe(4500);
  });

  it("rejects paying yourself or a non-positive amount", async () => {
    const t = await trip();
    const a = t.id("Asha"), b = t.id("Ben");
    await expect(addSettlement(db, t.secret, { from: a, to: a, amountMinor: 100, date: today }))
      .rejects.toThrow(/two different people/);
    await expect(addSettlement(db, t.secret, { from: b, to: a, amountMinor: -5, date: today }))
      .rejects.toThrow(SplitError);
  });
});

describe("fx overrides", () => {
  it("saves an override and surfaces it through loadGroup", async () => {
    const t = await trip();
    const result = await setFxOverride(db, t.secret, "thb", 0.0424);
    expect(result).toEqual({ currency: "THB", rate: 0.0424 });
    expect((await loadGroup(db, t.secret)).fxOverrides).toEqual({ THB: 0.0424 });
  });

  it("upserts rather than duplicating on a second save for the same currency", async () => {
    const t = await trip();
    await setFxOverride(db, t.secret, "THB", 0.0424);
    await setFxOverride(db, t.secret, "THB", 0.041);
    expect((await loadGroup(db, t.secret)).fxOverrides).toEqual({ THB: 0.041 });
  });

  it("rejects an override for the group's own base currency", async () => {
    const t = await trip();
    await expect(setFxOverride(db, t.secret, "CAD", 1.5)).rejects.toThrow(SplitError);
  });

  it("rejects a non-positive or non-finite rate", async () => {
    const t = await trip();
    await expect(setFxOverride(db, t.secret, "THB", 0)).rejects.toThrow(SplitError);
    await expect(setFxOverride(db, t.secret, "THB", -1)).rejects.toThrow(SplitError);
    await expect(setFxOverride(db, t.secret, "THB", NaN)).rejects.toThrow(SplitError);
  });

  it("returns not found for an unknown group secret", async () => {
    await expect(setFxOverride(db, "AAAAAAAAAAAAAAAAAAAAA", "THB", 0.04)).rejects.toThrow(NotFoundError);
  });
});
