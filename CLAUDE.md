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
  api/
    respond.ts    noStore/errorResponse/readJson, the SplitError/NotFoundError -> status contract
    schemas.ts    Zod structural schemas for request bodies
    index.ts      server-only barrel
  fx.ts           server-only Frankfurter fetch, cached a day (fx_overrides lookup happens client-side first)
  ui/
    api.ts        fetch wrappers over /api/split/*, client-only
    types.ts      mirrors the API's response shapes, does not import lib/split/db
    storage.ts    localStorage: device group list, per-group identity
    useGroup.ts   fetch-on-mount + refresh() hook backing the group page
    splitInput.ts client-side exact/percent reconciliation feedback
    __tests__/    unit tests for splitInput's reconciliation logic
app/api/split/    route handlers, one directory per endpoint (Next 16 async params)
  __tests__/      route handler tests, getDb mocked to PGlite
app/tools/running-tab/
  layout.tsx      wraps children in .running-tab, imports running-tab.css
  running-tab.css scoped design tokens, not in globals.css
  page.tsx        create-group form + device group list
  [secret]/page.tsx  the group page
components/split/
  ui/             Button, Card, TextField, NumberField, Select, SegmentedControl,
                  Badge, Avatar, EmptyState, Sheet (Tailwind + clsx, no inline styles)
  *.tsx           feature components built from ui/: CreateGroupForm, CurrencyPicker,
                  IdentityPicker, MemberList, ExpenseList/ExpenseRow, AddExpenseSheet,
                  BalancesPanel, SettleUpSheet
drizzle/          generated migrations (commit these)
drizzle.config.ts
vitest.config.ts
```

Split specs are stored as JSONB on the expense row (no separate splits table): shares are fully determined by the spec plus the expense id. Unknown JSON fields are stripped before storing.

### Commands

```bash
npm test               # all tests (105 at end of Phase 6)
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
- [x] **Next.js upgrade to 16.** Done on `nextjs-16-upgrade` (off `main`), merged to `main` via PR #1 (squash), Vercel preview checked. Next 14.2.5 → 16.3.5, React 18 → 19.3.0. `npm audit --omit=dev` clean (was 8 vulnerabilities incl. 1 critical). The codemod (`npx @next/codemod@canary upgrade latest`) made 0 code modifications, since this codebase has no `params`/`searchParams`, middleware, or `forwardRef`/`defaultProps`/string refs anywhere. See "Gotchas already hit" below for what the codemod got wrong and needed manual correction.
- [x] **Merge `main` into `splitter`.** Done. Conflicted in `package.json`/`package-lock.json` as expected; resolved by hand-reconciling `package.json` (kept both the Next 16/React 19 bump and the drizzle/vitest/pglite additions, bumped `@next/env` to `16.3.5` to match `next`) and regenerating the lockfile with `npm install` rather than merging it. All 63 tests, `npm run build`, and `npm run lint` still pass post-merge.
- [x] **Phase 3: API route handlers.** All 9 endpoints under `app/api/split/` (`POST groups`, `GET groups/[secret]`, `POST/PATCH members`, `POST/PATCH/DELETE/restore expenses`, `POST/DELETE settlements`, `GET fx`), written for Next 16's async `params`. Zod structural validation lives in `lib/split/api/schemas.ts`; business rules stay in `lib/split/db/queries.ts` as the single source of truth (not duplicated in Zod). Shared `noStore`/`errorResponse`/`readJson` helpers in `lib/split/api/respond.ts` give every route the `SplitError` → 400 / `NotFoundError` → 404 / `Cache-Control: no-store` contract without repeating it. Node runtime on every route. 25 new route handler tests (`app/api/split/__tests__/`) mock `getDb` to a PGlite instance the same way the Phase 2 integration tests do; also smoke-tested live against real Neon (group create, expense add, balances, fx, 404, then cleaned up). `vitest.config.ts` now includes `app/**/*.test.ts` and resolves the `@/*` alias.
  The `GET fx` route (`lib/split/fx.ts`) did a direct Frankfurter fetch with no caching or manual override at the time; both landed in Phase 5.
- [x] **Phase 4: UI.** `/tools/running-tab` (name settled; "Splitting Desk" and "The Kitty" were the other candidates). Deliberately does not reuse the marketing site's inline-style/CSS-variable convention: the user confirmed the rest of the site has its own design audit planned, so Running Tab got its own small design system instead of inheriting one about to be replaced.
  - Tokens scoped under a `.running-tab` wrapper class (`app/tools/running-tab/running-tab.css`, `app/tools/running-tab/layout.tsx`), Tailwind theme colors in `tailwind.config.js` pointing at those CSS variables. Real component primitives in `components/split/ui/` (Button, Card, TextField, NumberField, Select, SegmentedControl, Badge, Avatar, EmptyState, Sheet), built with Tailwind + `clsx` instead of inline `style={{}}` objects. Credit/debit color-coded balances. Framer Motion (installed but unused until now) powers `Sheet`'s drag-to-dismiss bottom sheet.
  - Gotcha worth remembering: Tailwind's opacity-modifier shorthand (`bg-rt-accent/90`) silently produces no background at all for a custom CSS-variable-backed theme color, rather than an error, making a button invisible (transparent bg, text color matching the page background) with no console warning. Found by inspecting `getComputedStyle` in a live browser check, not by lint or type-check. Fixed by precomputing the alpha blends as their own `color-mix()`-based CSS custom properties (`--rt-debit-soft`, etc.) instead of relying on the modifier. Avoid `rt-*/NN` opacity-modifier syntax anywhere in this tool.
  - Feature components in `components/split/`: `CreateGroupForm`, `CurrencyPicker`, `IdentityPicker`, `MemberList`, `ExpenseList`/`ExpenseRow`, `AddExpenseSheet` (all four split modes plus FX with an editable manual-override rate field), `BalancesPanel`, `SettleUpSheet`. Client data layer in `lib/split/ui/`: `api.ts` (fetch wrappers), `types.ts` (mirrors the API's shapes without importing the server-only `lib/split/db` barrel), `storage.ts` (device group list, per-group identity), `useGroup.ts`, `splitInput.ts` (client-side reconciliation feedback for exact/percent splits, mirroring `resolveSplit`'s tolerance logic).
  - Verified with a full real-browser walkthrough (create group, equal-split expense, exact-split expense in THB exercising live FX fetch and proportional-share conversion, simplified/raw balances toggle, settle up, edit/delete/restore, reload to confirm identity and device-group persistence) against the real Neon database, then cleaned up. 94 tests total (added `lib/split/ui/__tests__/splitInput.test.ts`).
  - Not done in this pass: adding the listing card to `/tools` (that's Phase 6's "ship to `/tools/<name>`").
- [x] **Phase 5: FX hardening.** Checked Frankfurter's actual `/v1/currencies` list live: it covers 30 currencies. Of the 32 in `CurrencyPicker`, 8 are not covered (VND, AED, SAR, MAD, COP, PEN, CLP, ARS). IDR, which this file previously listed as uncovered, is actually supported now; that line was stale.
  - New `fx_overrides` table (`lib/split/db/schema.ts`, migration `0001_bright_galactus.sql`), unique on `(groupId, currency)`. `setFxOverride` in `queries.ts` validates and upserts; rejects an override for the group's own base currency (nonsensical, rate is always 1 there) and non-positive/non-finite rates. `loadGroup` folds overrides into `GroupState.fxOverrides`.
  - `PUT /api/split/groups/[secret]/fx-overrides` (new route). `lib/split/fx.ts`'s Frankfurter fetch now passes `next: { revalidate: 86_400 }` (Next's server-side fetch cache, a different layer from the `Cache-Control: no-store` already on our own route's response, so the two don't conflict).
  - `AddExpenseSheet` checks `fxOverrides[currency]` before hitting Frankfurter at all, and offers a "Save as this trip's default rate" checkbox (unchecked by default, a deliberate opt-in, not automatic). Editing an expense whose currency hasn't been touched yet correctly keeps its originally-frozen rate rather than overwriting it with today's override or a fresh fetch (a `currencyDirty` flag distinguishes "just opened this edit sheet" from "user picked a different currency").
  - Verified live: added an expense in COP (confirmed uncovered, Frankfurter 404s, field stays editable), checked the save-as-default box, added a second COP expense and confirmed the rate pre-filled instantly with zero network calls (checked the dev server log to be sure). 104 tests total. Cleaned up the test group from Neon afterward.
- [x] **Running Tab redesign, golden-hour/Wealthsimple-adjacent.** Phase 4's design system (near-black + one bright accent on every button/badge, identical bordered cards for every list row, ALL-CAPS mono eyebrow labels above every section) read as generic AI-app defaults on review, confirmed against a design-critique skill on this machine (`frontend-design`, an Anthropic marketplace plugin under `~/.claude/plugins/marketplaces/claude-plugins-official/`, not installed for this project but readable directly via `cat`) that names those exact three patterns as the most common tells. Reference: Wealthsimple (confident, mostly black-and-white, color used as a deliberate occasional flourish, not load-bearing UI color). Four gradient moods were mocked up in a Claude Artifact and reviewed live before picking one.
  - Light is now the default theme (was dark); dark is still available via a new toggle Running Tab didn't have before (`components/split/ThemeToggle.tsx`), scoped to a `.dark` class on the `.running-tab` wrapper with its own `localStorage` key (`runningTab.theme`), deliberately separate from the marketing site's `html.light` mechanism, since the two tools now have opposite defaults and can't share one class/key.
  - All `--rt-*` tokens in `running-tab.css` recolored: warm paper background (`#F7F4EF`), warm ink text (`#1C1A17`) instead of pure black/white, muted sage/terracotta for credit/debit instead of saturated green/red. `rt-accent` (cyan) removed entirely as a UI color — primary buttons and selected states now use `bg-rt-ink-strong text-rt-bg`, which flips automatically per theme (near-black fill/light text in light mode, near-white fill/dark text in dark mode) since both tokens flip together.
  - The one whimsical device: `components/split/ui/GradientBlob.tsx`, a soft blurred golden-hour radial gradient (`#FFC971 → #FF8B7B → #E8A0BF`), used in exactly two spots (behind the balance hero number on the group page, behind the hero copy on the landing page) and nowhere else — never a button/badge fill.
  - `BalancesPanel` gained a hero card (`Card` + `GradientBlob`) showing the current device's own balance ("You owe $X" / "You're owed $X") big and prominent, above the existing full per-member breakdown; needed threading `currentMemberId` down from the group page's `identity`.
  - Expense list and the settle-up transfer list moved from one bordered `Card` per row to hairline-divided rows (`divide-y divide-rt-border` in one container) — the repeated-identical-card pattern was one of the three flagged tells.
  - Verified live in both themes on a real group page against real Neon data (balances hero, expense list, add-expense sheet, dark/light toggle), then cleaned up. 104 tests (styling-only pass, no test changes needed).
- [x] **Phase 6: hardening.** `Referrer-Policy: no-referrer` on `/tools/running-tab*` via `vercel.json` (same file the existing `X-Content-Type-Options`/`X-Frame-Options`/`X-XSS-Protection` rule lives in). This only takes effect on an actual Vercel deploy, not `npm run dev` — verify on the next preview.
  - Rate limiting on group creation (`lib/split/rateLimit.ts`, wired into `POST /api/split/groups`): a simple in-memory sliding window, 10 creations/hour per IP, deliberately not Redis- or Postgres-backed. Sized to the actual threat (a naive script spamming junk groups on a small, unlisted, friends-and-family tool), not a distributed attacker. Real limitation: resets on cold start and isn't shared across concurrent Vercel instances, so the effective limit is looser in practice than the number suggests. Move to Postgres or Upstash Redis if real abuse ever shows up. `RateLimitError` maps to 429 in `lib/split/api/respond.ts` (checked before the generic `SplitError` → 400 branch, since it extends `SplitError`). Verified live against real Neon: 11 rapid requests, 10 succeeded and the 11th 429'd, exactly at the boundary.
  - Audited empty/error state coverage across every feature component; found it already solid from Phases 3-5 (loading/not-found states on the group page, `EmptyState` on the expense list, per-form error text everywhere a mutation can fail, a generic "Something went wrong" fallback in `lib/split/ui/api.ts` for a true network failure, not just a non-2xx response) and made no changes there.
  - Added the "Running Tab" card to `/tools` (`app/tools/page.tsx`'s `tools` array, same pattern as Signing Desk), so `/tools/running-tab` is now publicly discoverable — but only once this branch reaches `main` and deploys. Still open: merging `splitter` into `main` and deploying is a separate, explicit decision, not done as part of this pass.

## Gotchas already hit

- `@types/node` is pinned to `^20`, so vitest is pinned to `^3` (vitest 5 requires newer node types). Do not bump vitest without handling that.
- Never run `npm audit fix --force`. Its suggested fix for drizzle-kit's moderate advisories is a downgrade to an ancient version. The dev-only moderates (esbuild, vitest) do not ship to users.
- `drizzle-kit migrate` may finish without printing a success line. Verify by listing tables in the `split` schema.
- The owner works in Terminal on macOS and is newer to git and the command line: explain commands briefly, and wait for one command to finish before suggesting the next.
- The Next 16 codemod (`@next/codemod@canary upgrade latest`) bumped `eslint` straight to `10.11.0`, but `eslint-config-next`'s bundled `eslint-plugin-react` actually crashes under eslint 10 (`contextOrFilename.getFilename is not a function`). Pin `eslint` to the latest `9.x` instead; it's flagged deprecated but is what the plugin ecosystem actually supports right now.
- The codemod also inserts `export const instant = false` into every route file as a Cache Components opt-out. It requires `nextConfig.cacheComponents` to be enabled, which the codemod does not add, so the build fails immediately unless you either enable that experimental flag or (simpler, and what we did) delete the inserted lines.
- No ESLint config existed anywhere in the repo before the Next 16 upgrade, so `public/tools/pdf-signer/vendor/*.min.js` (vendored third-party libraries) had never been linted. The new flat config (`eslint.config.mjs`) needs `public/**` in its `ignores`, or `next lint`/`eslint .` chokes on the minified vendor files.
- Next 16 auto-generates `dhruv-site/AGENTS.md` and `dhruv-site/CLAUDE.md` on every `next dev`/`next build` (agent guidance pointing at `node_modules/next/dist/docs/`). It does not touch this root `CLAUDE.md`. Disable with `agentRules: false` in `next.config.js` if unwanted; otherwise it just regenerates if deleted.
- Tailwind's opacity-modifier shorthand (e.g. `bg-rt-accent/90`) silently produces no background at all for a custom theme color backed by a bare `var(--rt-accent)` string, rather than erroring. Found this making an entire button invisible (transparent background, text color matching the page background) in Running Tab, with zero console warning; only `getComputedStyle` in a live browser check caught it. Use precomputed `color-mix()`-based CSS custom properties (see `--rt-debit-soft` etc. in `running-tab.css`) for any translucent tint on a custom theme color instead of the `/NN` modifier.
