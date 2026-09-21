import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

// Loads .env.local exactly the way `next dev` does, so no extra dotenv package.
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/split/db/schema.ts",
  out: "./drizzle",
  // Only manage our own schema, never anything else in the shared database.
  schemaFilter: ["split"],
  dbCredentials: {
    // Migrations need a direct session, not the pgbouncer pooler.
    url: process.env.DATABASE_URL_UNPOOLED ?? "",
  },
  strict: true,
  verbose: true,
});
