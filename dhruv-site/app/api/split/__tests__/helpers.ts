import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { NextRequest } from "next/server";
import { schema } from "@/lib/split/db/schema";
import type { SplitDb } from "@/lib/split/db/client";

/**
 * Route handler tests mock "@/lib/split/db/client" to return this instead of
 * a real Neon connection. Each test file calls this once in beforeAll and
 * assigns the result to the `db` variable its vi.mock factory closes over.
 */
export async function makeTestDb(): Promise<SplitDb> {
  const client = new PGlite();
  const pg = drizzle(client, { schema });
  await migrate(pg, { migrationsFolder: "./drizzle" });
  return pg as unknown as SplitDb;
}

export function jsonRequest(url: string, method: string, body?: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
