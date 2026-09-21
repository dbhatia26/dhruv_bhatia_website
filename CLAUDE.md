# CLAUDE.md

Context for Claude Code working in this repo. Read fully before making changes.

## Repo

- Personal site for dhruvbhatia.io. Owner: Dhruv (Vancouver, BC).
- The Next.js app lives in `dhruv-site/`, not the repo root. Run all npm commands from `dhruv-site/`.
- Stack: Next.js 14.2.35 (App Router), React 18, TypeScript, Tailwind, Framer Motion, deployed on Vercel.
- `/tools/` hosts free tools that replace subscription software. Existing: Signing Desk (PDF signer, fully client-side).
- Owner preference: no em dashes in any prose, commit messages, comments or UI copy. Use commas, periods or parentheses.

## Current project: Splitwise replacement

Branch: `splitter`. Product name undecided (candidates: Running Tab, The Kitty, Splitting Desk). Route placeholder is `/tools/split`; settle the name before building routes, since the route ends up in every shared group link.

Primary use case: splitting expenses between friends on short trips. Groups are small (3 to 8 people), short-lived, and used mostly on phones.

### Locked product decisions

- **Shared link, no accounts.** A group lives at an unguessable URL (21-char nanoid secret). Anyone with the link can read and write. No signup. Logins are deferred to v2 and the schema allows adding them later.
- **Identity without accounts:** a "who are you?" picker, remembered per device in localStorage, used to fill `createdBy`. A list of groups opened on this device is also kept in localStorage.
- **v1 features:** equal / exact / percent / shares splits, multi-currency with FX, balances, settle-up with debt simplification (plus a raw pairwise view toggle), recorded settlements, edit and soft-delete with restore.
- **Currency:** new groups default to CAD, with a currency picker on creation. Common currencies (CAD, USD, EUR, GBP) listed first.
- **Members** can be added and renamed, not removed, in v1.
- **Out of scope for v1:** logins, itemized splits, receipt photos, recurring expenses, CSV export, charts, offline queue, member removal, native apps. A PWA (home screen install, service worker) is a possible later step.

### Invariants: do not break these

- **Money is always integer minor units.** Floats never touch money. Convert at the UI boundary with `toMinor` / `fromMinor`.
- **FX rates are frozen at entry.** `convertToBase` runs once when an expense is saved; `fxRate` and `baseAmountMinor` are stored and never recomputed. Otherwise historical balances drift daily.
- **Exact split amounts are in the expense's own currency.** `splitForBase` treats them as proportional shares of the base amount, so a 2,400 THB dinner split 1,000 / 1,400 THB converts correctly and still sums to the cent. Validation of the split happens in the entered currency.
- **Leftover cents rotate** by a hash of the expense id, so no one absorbs the extra cent on every expense.
- **Soft deletes only** for expenses and settlements (`deletedAt`). The core math skips deleted rows itself.
- **Every write is scoped by group.** All queries look up the group by secret, then filter by both row id and `groupId`. A test verifies one group's link cannot touch another group's rows; it was mutation-checked (removing the filter makes it fail). Keep it that way.
- **Never expose internal ids of groups.** Only the secret appears in URLs.
- **Keep `@/lib/split` (pure math) separate from `@/lib/split/db` (server only)** so the database driver never reaches the browser bundle.

### Code layout (in `dhruv-site/`)

```
lib/split/
  types.ts        domain types, SplitError
  allocate.ts     largest-remainder allocation with rotation
  split.ts        resolveSplit for the four modes, with validation
  currency.ts     minor-unit exponents, conversion, formatting
  balances.ts     computeBalances, simplifyDebts, rawDebts, splitForBase
  index.ts        pure barrel (safe for client components)
  __tests__/      unit tests + fuzz test (3,000 random groups)
  db/
    schema.ts     Drizzle schema in the `split` Postgres schema
    client.ts     lazy Neon HTTP client; SplitDb type
    queries.ts    group/member/expense/settlement functions with validation
    index.ts      server-only barrel
    __tests__/    integration tests against in-process PGlite
drizzle/          generated migrations (commit these)
drizzle.config.ts
vitest.config.ts
```

Split specs are stored as JSONB on the expense row (no separate splits table): shares are fully determined by the spec plus the expense id. Unknown JSON fields are stripped before storing.

### Commands

```bash
npm test               # all tests (63 at end of Phase 2)
npm run test:watch
npm run db:generate    # after changing schema.ts
npm run db:migrate     # apply migrations to Neon
npm run db:studio      # browse the database
npm run dev
npm run build          # run before pushing anything non-trivial
```

### Database and environment

- Neon Postgres `dhruv-site-db`, Portland region, connected through the Vercel integration. Shared by future tools; each tool gets its own Postgres schema.
- Vercel function region is Portland (`pdx1`) to sit next to the database.
- Env vars exist for Production and Preview only, not Development. Pull locally with:
  `vercel env pull .env.local --environment=preview`
  A plain `vercel env pull` fetches the empty Development set and wipes `DATABASE_URL`.
- `DATABASE_URL` (pooled) is used by the app; `DATABASE_URL_UNPOOLED` is used by migrations.
- Neon Auth was enabled by accident during setup. Its env vars (`NEON_AUTH_*`) are unused. Ignore them.
- Preview deployments share the production database (no Neon branching yet). Consider enabling preview branching once real trip data exists.
- Never print, log or commit `.env.local` or connection strings.

## Status and plan

- [x] **Phase 1:** pure split math with unit and fuzz tests.
- [x] **Phase 2:** schema, migrations (applied to Neon), data layer, PGlite integration tests.
- [ ] **Next.js upgrade to 16** (do before Phase 3). On its own branch off `main`, not `splitter`, so the live site gets the security fixes independently. Next 14 no longer receives security fixes; `npm audit --omit=dev` is clean on 16.3.x. Requires React 19. Start with `npx @next/codemod@canary upgrade latest`, check Framer Motion supports React 19, bump `@next/env` to match `next`, run `npm run build`, check the Vercel preview on a phone, merge to `main`, then merge `main` into `splitter`.
- [ ] **Phase 3: API route handlers** (written for Next 16, where params are async).
  Proposed endpoints under `app/api/split/`:
  - `POST groups`, `GET groups/[secret]` (state plus balances, simplified and raw)
  - `POST groups/[secret]/members`, `PATCH .../members/[id]`
  - `POST .../expenses`, `PATCH .../expenses/[id]`, `DELETE .../expenses/[id]`, `POST .../expenses/[id]/restore`
  - `POST .../settlements`, `DELETE .../settlements/[id]`
  - `GET fx?from=THB&to=CAD`
  Validate request bodies with Zod at the boundary. Map `SplitError` to 400 and `NotFoundError` to 404. Node runtime, `Cache-Control: no-store`. Add route handler tests.
- [ ] **Phase 4: UI.** Mobile first. Match the site's existing visual style and Framer Motion conventions. Group page, add-expense sheet, balances, settle-up with simplified/raw toggle, identity picker, device group list. Note in the UI that base-currency totals will not exactly match card statements (banks apply their own rates and fees).
- [ ] **Phase 5: FX.** Frankfurter at `https://api.frankfurter.dev/v1` (ECB rates, no key, about 30 currencies, updated once per working day). Fetch server-side only. Manual rate override is required, since many travel currencies (VND, COP, MAD, IDR and others) are not covered.
- [ ] **Phase 6: hardening and deploy.** `Referrer-Policy: no-referrer` on group routes so the secret never leaks, rate limiting on group creation, empty and error states, then ship to `/tools/<name>`.

## Gotchas already hit

- `@types/node` is pinned to `^20`, so vitest is pinned to `^3` (vitest 5 requires newer node types). Do not bump vitest without handling that.
- Never run `npm audit fix --force`. Its suggested fix for drizzle-kit's moderate advisories is a downgrade to an ancient version. The dev-only moderates (esbuild, vitest) do not ship to users.
- `drizzle-kit migrate` may finish without printing a success line. Verify by listing tables in the `split` schema.
- The owner works in Terminal on macOS and is newer to git and the command line: explain commands briefly, and wait for one command to finish before suggesting the next.
