import { describe, it, expect, beforeAll, vi } from "vitest";
import type { SplitDb } from "@/lib/split/db/client";
import { makeTestDb, jsonRequest } from "./helpers";

let db: SplitDb;
vi.mock("@/lib/split/db/client", () => ({ getDb: () => db }));

import { POST as createGroup } from "../groups/route";

beforeAll(async () => {
  db = await makeTestDb();
}, 30_000);

// Deliberately its own file: vitest isolates modules per test file, so this
// test can exhaust the in-memory rate-limit bucket without affecting the
// createGroup calls other test files make against the same route.
describe("POST /api/split/groups rate limiting", () => {
  it("429s once a single IP exceeds the per-hour group-creation limit", async () => {
    const attempt = (i: number) =>
      createGroup(
        jsonRequest("http://test/api/split/groups", "POST", {
          name: `Rate limit test ${i}`,
          baseCurrency: "CAD",
          memberNames: ["A"],
        })
      );

    const results = [];
    for (let i = 0; i < 15; i++) {
      results.push(await attempt(i));
    }

    const limited = results.filter((r) => r.status === 429);
    expect(limited.length).toBeGreaterThan(0);

    const body = await limited[0].json();
    expect(body.error).toMatch(/too many/i);
  });
});
