import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { schema } from "./schema";

/**
 * Any Postgres-backed Drizzle database with our schema. Production passes the
 * Neon HTTP client below; tests pass an in-process PGlite database. The query
 * functions accept this type, so they never know or care which one they got.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SplitDb = PgDatabase<PgQueryResultHKT, typeof schema, any>;

let cached: SplitDb | null = null;

/**
 * Created on first use rather than at import, so a missing DATABASE_URL fails
 * loudly on the request that needs it instead of breaking the whole build.
 */
export function getDb(): SplitDb {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Locally, run: vercel env pull .env.local --environment=preview"
    );
  }
  cached = drizzle(neon(url), { schema }) as unknown as SplitDb;
  return cached;
}
