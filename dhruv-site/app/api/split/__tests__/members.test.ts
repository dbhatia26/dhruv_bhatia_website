import { describe, it, expect, beforeAll, vi } from "vitest";
import type { SplitDb } from "@/lib/split/db/client";
import { makeTestDb, jsonRequest } from "./helpers";

let db: SplitDb;
vi.mock("@/lib/split/db/client", () => ({ getDb: () => db }));

import { POST as createGroup } from "../groups/route";
import { POST as addMember } from "../groups/[secret]/members/route";
import { PATCH as renameMember } from "../groups/[secret]/members/[id]/route";

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
  return res.json() as Promise<{ secret: string; members: { id: string; name: string }[] }>;
}

describe("POST /api/split/groups/[secret]/members", () => {
  it("adds a member", async () => {
    const { secret } = await trip();
    const res = await addMember(
      jsonRequest(`http://test/x`, "POST", { name: "Ben" }),
      { params: Promise.resolve({ secret }) }
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Ben");
  });

  it("400s on a duplicate name (case-insensitive)", async () => {
    const { secret } = await trip();
    const res = await addMember(
      jsonRequest(`http://test/x`, "POST", { name: "asha" }),
      { params: Promise.resolve({ secret }) }
    );
    expect(res.status).toBe(400);
  });

  it("404s for an unknown group secret", async () => {
    const res = await addMember(
      jsonRequest(`http://test/x`, "POST", { name: "Ben" }),
      { params: Promise.resolve({ secret: "AAAAAAAAAAAAAAAAAAAAA" }) }
    );
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/split/groups/[secret]/members/[id]", () => {
  it("renames a member", async () => {
    const { secret, members } = await trip();
    const res = await renameMember(
      jsonRequest(`http://test/x`, "PATCH", { name: "Asha K." }),
      { params: Promise.resolve({ secret, id: members[0].id }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Asha K.");
  });

  it("404s for an unknown member id", async () => {
    const { secret } = await trip();
    const res = await renameMember(
      jsonRequest(`http://test/x`, "PATCH", { name: "Someone" }),
      { params: Promise.resolve({ secret, id: "00000000-0000-0000-0000-000000000000" }) }
    );
    expect(res.status).toBe(404);
  });
});
