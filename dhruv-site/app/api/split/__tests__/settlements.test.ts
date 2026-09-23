import { describe, it, expect, beforeAll, vi } from "vitest";
import type { SplitDb } from "@/lib/split/db/client";
import { makeTestDb, jsonRequest } from "./helpers";

let db: SplitDb;
vi.mock("@/lib/split/db/client", () => ({ getDb: () => db }));

import { POST as createGroup } from "../groups/route";
import { POST as addSettlement } from "../groups/[secret]/settlements/route";
import { DELETE as deleteSettlement } from "../groups/[secret]/settlements/[id]/route";

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

describe("POST /api/split/groups/[secret]/settlements", () => {
  it("records a settlement", async () => {
    const { secret, members } = await trip();
    const [asha, ben] = members.map((m) => m.id);
    const res = await addSettlement(
      jsonRequest("http://test/x", "POST", {
        from: ben,
        to: asha,
        amountMinor: 3000,
        date: "2026-03-02",
      }),
      { params: Promise.resolve({ secret }) }
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.amountMinor).toBe(3000);
  });

  it("400s when settling with yourself", async () => {
    const { secret, members } = await trip();
    const [asha] = members.map((m) => m.id);
    const res = await addSettlement(
      jsonRequest("http://test/x", "POST", {
        from: asha,
        to: asha,
        amountMinor: 100,
        date: "2026-03-02",
      }),
      { params: Promise.resolve({ secret }) }
    );
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/split/groups/[secret]/settlements/[id]", () => {
  it("soft-deletes a settlement", async () => {
    const { secret, members } = await trip();
    const [asha, ben] = members.map((m) => m.id);
    const created = await addSettlement(
      jsonRequest("http://test/x", "POST", {
        from: ben,
        to: asha,
        amountMinor: 3000,
        date: "2026-03-02",
      }),
      { params: Promise.resolve({ secret }) }
    );
    const { id } = await created.json();
    const res = await deleteSettlement(jsonRequest("http://test/x", "DELETE"), {
      params: Promise.resolve({ secret, id }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).deletedAt).not.toBeNull();
  });

  it("404s on an unknown settlement id", async () => {
    const { secret } = await trip();
    const res = await deleteSettlement(jsonRequest("http://test/x", "DELETE"), {
      params: Promise.resolve({ secret, id: "00000000-0000-0000-0000-000000000000" }),
    });
    expect(res.status).toBe(404);
  });
});
