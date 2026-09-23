import { describe, it, expect, beforeAll, vi } from "vitest";
import type { SplitDb } from "@/lib/split/db/client";
import { makeTestDb, jsonRequest } from "./helpers";

let db: SplitDb;
vi.mock("@/lib/split/db/client", () => ({ getDb: () => db }));

import { POST as createGroup } from "../groups/route";
import { POST as addExpense } from "../groups/[secret]/expenses/route";
import { PATCH as updateExpense, DELETE as deleteExpense } from "../groups/[secret]/expenses/[id]/route";
import { POST as restoreExpense } from "../groups/[secret]/expenses/[id]/restore/route";

beforeAll(async () => {
  db = await makeTestDb();
}, 30_000);

async function trip() {
  const res = await createGroup(
    jsonRequest("http://test/api/split/groups", "POST", {
      name: "Trip",
      baseCurrency: "CAD",
      memberNames: ["Asha", "Ben"],
    })
  );
  return res.json() as Promise<{ secret: string; members: { id: string; name: string }[] }>;
}

function dinner(paidBy: string, participants: string[]) {
  return {
    description: "Dinner",
    amountMinor: 6000,
    currency: "CAD",
    fxRate: 1,
    paidBy,
    split: { mode: "equal", participants },
    date: "2026-03-01",
  };
}

describe("POST /api/split/groups/[secret]/expenses", () => {
  it("adds an expense", async () => {
    const { secret, members } = await trip();
    const [asha, ben] = members.map((m) => m.id);
    const res = await addExpense(
      jsonRequest("http://test/x", "POST", dinner(asha, [asha, ben])),
      { params: Promise.resolve({ secret }) }
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.baseAmountMinor).toBe(6000);
  });

  it("400s when the split does not reconcile", async () => {
    const { secret, members } = await trip();
    const [asha, ben] = members.map((m) => m.id);
    const res = await addExpense(
      jsonRequest("http://test/x", "POST", {
        ...dinner(asha, [asha, ben]),
        split: { mode: "exact", amounts: { [asha]: 1000, [ben]: 1000 } },
      }),
      { params: Promise.resolve({ secret }) }
    );
    expect(res.status).toBe(400);
  });

  it("400s when a split references someone outside the group", async () => {
    const { secret, members } = await trip();
    const [asha] = members.map((m) => m.id);
    const res = await addExpense(
      jsonRequest("http://test/x", "POST", dinner(asha, [asha, "00000000-0000-0000-0000-000000000000"])),
      { params: Promise.resolve({ secret }) }
    );
    expect(res.status).toBe(400);
  });
});

describe("PATCH/DELETE/restore expenses", () => {
  it("updates, soft-deletes, and restores an expense", async () => {
    const { secret, members } = await trip();
    const [asha, ben] = members.map((m) => m.id);
    const created = await addExpense(
      jsonRequest("http://test/x", "POST", dinner(asha, [asha, ben])),
      { params: Promise.resolve({ secret }) }
    );
    const { id } = await created.json();
    const params = { params: Promise.resolve({ secret, id }) };

    const updated = await updateExpense(
      jsonRequest("http://test/x", "PATCH", { ...dinner(asha, [asha, ben]), amountMinor: 8000 }),
      params
    );
    expect(updated.status).toBe(200);
    expect((await updated.json()).amountMinor).toBe(8000);

    const deleted = await deleteExpense(jsonRequest("http://test/x", "DELETE"), params);
    expect(deleted.status).toBe(200);
    expect((await deleted.json()).deletedAt).not.toBeNull();

    const restored = await restoreExpense(jsonRequest("http://test/x", "POST"), params);
    expect(restored.status).toBe(200);
    expect((await restored.json()).deletedAt).toBeNull();
  });

  it("404s on an unknown expense id", async () => {
    const { secret } = await trip();
    const params = {
      params: Promise.resolve({ secret, id: "00000000-0000-0000-0000-000000000000" }),
    };
    const res = await deleteExpense(jsonRequest("http://test/x", "DELETE"), params);
    expect(res.status).toBe(404);
  });
});
