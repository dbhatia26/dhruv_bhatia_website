import { describe, it, expect, beforeAll, vi } from "vitest";
import type { SplitDb } from "@/lib/split/db/client";
import { makeTestDb, jsonRequest } from "./helpers";

let db: SplitDb;
vi.mock("@/lib/split/db/client", () => ({ getDb: () => db }));

import { POST as createGroup } from "../groups/route";
import { GET as getGroup } from "../groups/[secret]/route";
import { PUT as setFxOverride } from "../groups/[secret]/fx-overrides/route";

beforeAll(async () => {
  db = await makeTestDb();
}, 30_000);

async function trip() {
  const res = await createGroup(
    jsonRequest("http://test/api/split/groups", "POST", {
      name: "Trip",
      baseCurrency: "CAD",
      memberNames: ["Asha"],
    })
  );
  return res.json() as Promise<{ secret: string }>;
}

describe("PUT /api/split/groups/[secret]/fx-overrides", () => {
  it("saves an override and it shows up on the group", async () => {
    const { secret } = await trip();
    const res = await setFxOverride(
      jsonRequest("http://test/x", "PUT", { currency: "thb", rate: 0.0424 }),
      { params: Promise.resolve({ secret }) }
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ currency: "THB", rate: 0.0424 });

    const group = await getGroup(jsonRequest(`http://test/x`, "GET"), {
      params: Promise.resolve({ secret }),
    });
    expect((await group.json()).fxOverrides).toEqual({ THB: 0.0424 });
  });

  it("400s for the group's own base currency", async () => {
    const { secret } = await trip();
    const res = await setFxOverride(
      jsonRequest("http://test/x", "PUT", { currency: "CAD", rate: 1.5 }),
      { params: Promise.resolve({ secret }) }
    );
    expect(res.status).toBe(400);
  });

  it("400s on a structurally invalid body", async () => {
    const { secret } = await trip();
    const res = await setFxOverride(
      jsonRequest("http://test/x", "PUT", { currency: "THB", rate: "not a number" }),
      { params: Promise.resolve({ secret }) }
    );
    expect(res.status).toBe(400);
  });

  it("404s for an unknown group secret", async () => {
    const res = await setFxOverride(
      jsonRequest("http://test/x", "PUT", { currency: "THB", rate: 0.04 }),
      { params: Promise.resolve({ secret: "AAAAAAAAAAAAAAAAAAAAA" }) }
    );
    expect(res.status).toBe(404);
  });
});
