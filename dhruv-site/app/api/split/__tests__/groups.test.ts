import { describe, it, expect, beforeAll, vi } from "vitest";
import { NextRequest } from "next/server";
import type { SplitDb } from "@/lib/split/db/client";
import { makeTestDb, jsonRequest } from "./helpers";

let db: SplitDb;
vi.mock("@/lib/split/db/client", () => ({ getDb: () => db }));

import { POST as createGroup } from "../groups/route";
import { GET as getGroup } from "../groups/[secret]/route";
import { POST as addExpense } from "../groups/[secret]/expenses/route";

beforeAll(async () => {
  db = await makeTestDb();
}, 30_000);

describe("POST /api/split/groups", () => {
  it("creates a group", async () => {
    const req = jsonRequest("http://test/api/split/groups", "POST", {
      name: "Iceland trip",
      baseCurrency: "cad",
      memberNames: ["Asha", "Ben"],
    });
    const res = await createGroup(req);
    expect(res.status).toBe(201);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const body = await res.json();
    expect(body.secret).toMatch(/^[A-Za-z0-9_-]{21}$/);
    expect(body.members).toHaveLength(2);
  });

  it("400s on invalid input via the SplitError path", async () => {
    const req = jsonRequest("http://test/api/split/groups", "POST", {
      name: "x",
      baseCurrency: "DOLLARS",
      memberNames: ["A"],
    });
    const res = await createGroup(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/currency/);
  });

  it("400s with issues on a structurally malformed body via Zod", async () => {
    const req = jsonRequest("http://test/api/split/groups", "POST", {
      name: "x",
      baseCurrency: "CAD",
      memberNames: "not an array",
    });
    const res = await createGroup(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid request");
    expect(body.issues.length).toBeGreaterThan(0);
  });

  it("400s on a non-JSON body", async () => {
    const req = new NextRequest("http://test/api/split/groups", {
      method: "POST",
      body: "not json",
    });
    const res = await createGroup(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/split/groups/[secret]", () => {
  it("returns state plus simplified and raw balances", async () => {
    const created = await createGroup(
      jsonRequest("http://test/api/split/groups", "POST", {
        name: "Iceland trip",
        baseCurrency: "CAD",
        memberNames: ["Asha", "Ben"],
      })
    );
    const { secret, members } = await created.json();
    const asha = members.find((m: { name: string }) => m.name === "Asha").id;
    const ben = members.find((m: { name: string }) => m.name === "Ben").id;

    await addExpense(
      jsonRequest(`http://test/api/split/groups/${secret}/expenses`, "POST", {
        description: "Dinner",
        amountMinor: 6000,
        currency: "CAD",
        fxRate: 1,
        paidBy: asha,
        split: { mode: "equal", participants: [asha, ben] },
        date: "2026-03-01",
      }),
      { params: Promise.resolve({ secret }) }
    );

    const res = await getGroup(jsonRequest(`http://test/api/split/groups/${secret}`, "GET"), {
      params: Promise.resolve({ secret }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.group.baseCurrency).toBe("CAD");
    expect(body.expenses).toHaveLength(1);
    expect(body.balances.net[asha]).toBe(3000);
    expect(body.balances.net[ben]).toBe(-3000);
    expect(body.balances.simplified).toEqual([{ from: ben, to: asha, amountMinor: 3000 }]);
    expect(body.balances.raw).toEqual([{ from: ben, to: asha, amountMinor: 3000 }]);
  });

  it("404s for an unknown secret", async () => {
    const res = await getGroup(jsonRequest("http://test/x", "GET"), {
      params: Promise.resolve({ secret: "AAAAAAAAAAAAAAAAAAAAA" }),
    });
    expect(res.status).toBe(404);
  });
});
