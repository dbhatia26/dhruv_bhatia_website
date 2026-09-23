import { and, asc, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { resolveSplit } from "../split";
import { convertToBase } from "../currency";
import type { Expense, MemberId, Settlement, SplitSpec } from "../types";
import { SplitError } from "../types";
import type { SplitDb } from "./client";
import { expenses, fxOverrides, groups, members, settlements } from "./schema";

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/** The API layer maps this to 404. Deliberately vague about why. */
export class NotFoundError extends Error {
  constructor(what = "Not found") {
    super(what);
    this.name = "NotFoundError";
  }
}

// SplitError (from ../types) is used for all validation failures -> 400.

// ---------------------------------------------------------------------------
// Public shapes
// ---------------------------------------------------------------------------

export interface GroupInfo {
  name: string;
  baseCurrency: string;
  createdAt: string;
}

export interface Member {
  id: MemberId;
  name: string;
}

export interface ExpenseRecord extends Expense {
  createdBy: MemberId | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface SettlementRecord extends Settlement {
  createdBy: MemberId | null;
  createdAt: string;
}

export interface GroupState {
  group: GroupInfo;
  members: Member[];
  /** Includes soft-deleted expenses (deletedAt set) so history can show them. */
  expenses: ExpenseRecord[];
  /** Includes soft-deleted settlements, same reason. */
  settlements: SettlementRecord[];
  /** Saved default exchange rates by currency, used to prefill new expenses. */
  fxOverrides: Record<string, number>;
}

export interface ExpenseInput {
  description: string;
  amountMinor: number;
  currency: string;
  /** Base units per 1 unit of currency. Must be exactly 1 for the base currency. */
  fxRate: number;
  paidBy: MemberId;
  split: SplitSpec;
  /** YYYY-MM-DD */
  date: string;
  createdBy?: MemberId | null;
}

export interface SettlementInput {
  from: MemberId;
  to: MemberId;
  amountMinor: number;
  date: string;
  createdBy?: MemberId | null;
}

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

export const LIMITS = {
  groupName: 80,
  memberName: 40,
  description: 200,
  maxMembers: 30,
  /** 10 billion minor units. Well inside Number.MAX_SAFE_INTEGER. */
  maxAmountMinor: 10_000_000_000,
} as const;

// nanoid default alphabet and length.
const SECRET_RE = /^[A-Za-z0-9_-]{21}$/;
const CURRENCY_RE = /^[A-Z]{3}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A malformed id would make Postgres throw a cast error; report not found. */
function requireId(id: unknown, what: string): string {
  if (typeof id !== "string" || !UUID_RE.test(id)) throw new NotFoundError(`${what} not found`);
  return id;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function cleanText(value: unknown, field: string, max: number): string {
  if (typeof value !== "string") throw new SplitError(`${field} is required`);
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0) throw new SplitError(`${field} is required`);
  if (trimmed.length > max) throw new SplitError(`${field} must be ${max} characters or fewer`);
  return trimmed;
}

function cleanCurrency(value: unknown): string {
  const code = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!CURRENCY_RE.test(code)) throw new SplitError("currency must be a 3-letter code like CAD");
  return code;
}

function cleanDate(value: unknown): string {
  if (typeof value !== "string" || !DATE_RE.test(value)) {
    throw new SplitError("date must be YYYY-MM-DD");
  }
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) {
    throw new SplitError("date is not a real calendar date");
  }
  return value;
}

function cleanAmount(value: unknown, field = "amount"): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new SplitError(`${field} must be a whole number of minor units`);
  }
  if (value <= 0) throw new SplitError(`${field} must be greater than zero`);
  if (value > LIMITS.maxAmountMinor) throw new SplitError(`${field} is too large`);
  return value;
}

/**
 * Rebuild the split spec from known fields only. Whatever else a client sends
 * in the JSON is dropped rather than stored.
 */
function cleanSplit(spec: unknown): SplitSpec {
  if (!spec || typeof spec !== "object") throw new SplitError("split is required");
  const s = spec as Record<string, unknown>;

  const numberMap = (raw: unknown, field: string): Record<string, number> => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new SplitError(`split.${field} must be an object`);
    }
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v !== "number" || !Number.isFinite(v)) {
        throw new SplitError(`split.${field} values must be numbers`);
      }
      out[k] = v;
    }
    return out;
  };

  switch (s.mode) {
    case "equal": {
      if (!Array.isArray(s.participants) || !s.participants.every((p) => typeof p === "string")) {
        throw new SplitError("split.participants must be a list of member ids");
      }
      return { mode: "equal", participants: [...new Set(s.participants as string[])] };
    }
    case "exact":
      return { mode: "exact", amounts: numberMap(s.amounts, "amounts") };
    case "percent":
      return { mode: "percent", percents: numberMap(s.percents, "percents") };
    case "shares":
      return { mode: "shares", shares: numberMap(s.shares, "shares") };
    default:
      throw new SplitError("split.mode must be equal, exact, percent or shares");
  }
}

function splitMemberIds(spec: SplitSpec): string[] {
  switch (spec.mode) {
    case "equal":
      return spec.participants;
    case "exact":
      return Object.keys(spec.amounts);
    case "percent":
      return Object.keys(spec.percents);
    case "shares":
      return Object.keys(spec.shares);
  }
}

function assertMembers(ids: (string | null | undefined)[], valid: Set<string>) {
  for (const id of ids) {
    if (id == null) continue;
    if (!valid.has(id)) throw new SplitError("references a member who is not in this group");
  }
}

/** Unique-violation detection across both the Neon and PGlite drivers. */
function isUniqueViolation(err: unknown): boolean {
  let e: unknown = err;
  for (let i = 0; i < 4 && e; i++) {
    if ((e as { code?: string }).code === "23505") return true;
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

// ---------------------------------------------------------------------------
// Internal lookups
// ---------------------------------------------------------------------------

async function requireGroup(db: SplitDb, secret: string) {
  // Reject malformed secrets without touching the database.
  if (typeof secret !== "string" || !SECRET_RE.test(secret)) {
    throw new NotFoundError("Group not found");
  }
  const [row] = await db.select().from(groups).where(eq(groups.secret, secret)).limit(1);
  if (!row) throw new NotFoundError("Group not found");
  return row;
}

async function memberIdSet(db: SplitDb, groupId: string): Promise<Set<string>> {
  const rows = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.groupId, groupId));
  return new Set(rows.map((r) => r.id));
}

type ExpenseRow = typeof expenses.$inferSelect;
type SettlementRow = typeof settlements.$inferSelect;

function toExpenseRecord(r: ExpenseRow): ExpenseRecord {
  return {
    id: r.id,
    description: r.description,
    amountMinor: r.amountMinor,
    currency: r.currency,
    fxRate: r.fxRate,
    baseAmountMinor: r.baseAmountMinor,
    paidBy: r.paidBy,
    split: r.split,
    date: r.date,
    deletedAt: iso(r.deletedAt),
    createdBy: r.createdBy,
    createdAt: r.createdAt.toISOString(),
    updatedAt: iso(r.updatedAt),
  };
}

function toSettlementRecord(r: SettlementRow): SettlementRecord {
  return {
    id: r.id,
    from: r.fromMember,
    to: r.toMember,
    amountMinor: r.amountMinor,
    date: r.date,
    deletedAt: iso(r.deletedAt),
    createdBy: r.createdBy,
    createdAt: r.createdAt.toISOString(),
  };
}

/**
 * Validate an expense against its group and compute the frozen base amount.
 * The split is checked in the currency it was entered in.
 */
function prepareExpense(
  input: ExpenseInput,
  baseCurrency: string,
  validMembers: Set<string>
) {
  const description = cleanText(input.description, "description", LIMITS.description);
  const amountMinor = cleanAmount(input.amountMinor);
  const currency = cleanCurrency(input.currency);
  const date = cleanDate(input.date);
  const split = cleanSplit(input.split);

  if (typeof input.fxRate !== "number") throw new SplitError("fxRate is required");
  // Throws on a non-positive rate, or a rate other than 1 for the base currency.
  const baseAmountMinor = convertToBase(amountMinor, currency, baseCurrency, input.fxRate);

  assertMembers([input.paidBy, input.createdBy, ...splitMemberIds(split)], validMembers);

  // Throws SplitError if exact amounts do not reconcile, percents miss 100, etc.
  resolveSplit(amountMinor, split, "validate");

  return {
    description,
    amountMinor,
    currency,
    fxRate: input.fxRate,
    baseAmountMinor,
    paidBy: input.paidBy,
    split,
    date,
  };
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export async function createGroup(
  db: SplitDb,
  input: { name: string; baseCurrency: string; memberNames: string[] }
): Promise<{ secret: string; members: Member[] }> {
  const name = cleanText(input.name, "group name", LIMITS.groupName);
  const baseCurrency = cleanCurrency(input.baseCurrency);

  if (!Array.isArray(input.memberNames) || input.memberNames.length === 0) {
    throw new SplitError("add at least one person");
  }
  if (input.memberNames.length > LIMITS.maxMembers) {
    throw new SplitError(`a group can have at most ${LIMITS.maxMembers} people`);
  }
  const memberNames = input.memberNames.map((n) => cleanText(n, "name", LIMITS.memberName));
  const lowered = memberNames.map((n) => n.toLowerCase());
  if (new Set(lowered).size !== lowered.length) {
    throw new SplitError("each person needs a different name");
  }

  const secret = nanoid();
  const [group] = await db
    .insert(groups)
    .values({ secret, name, baseCurrency })
    .returning({ id: groups.id });

  // Two statements, not a transaction: the Neon HTTP driver has no interactive
  // transactions. If this second insert failed, the orphaned group would have
  // no link anyone knows, so it is harmless.
  const inserted = await db
    .insert(members)
    .values(memberNames.map((n) => ({ groupId: group.id, name: n })))
    .returning({ id: members.id, name: members.name });

  return { secret, members: sortMembers(inserted) };
}

function sortMembers(list: Member[]): Member[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadGroup(db: SplitDb, secret: string): Promise<GroupState> {
  const group = await requireGroup(db, secret);

  const [memberRows, expenseRows, settlementRows, fxOverrideRows] = await Promise.all([
    db.select({ id: members.id, name: members.name })
      .from(members)
      .where(eq(members.groupId, group.id)),
    db.select().from(expenses)
      .where(eq(expenses.groupId, group.id))
      .orderBy(asc(expenses.date), asc(expenses.createdAt)),
    db.select().from(settlements)
      .where(eq(settlements.groupId, group.id))
      .orderBy(asc(settlements.date), asc(settlements.createdAt)),
    db.select({ currency: fxOverrides.currency, rate: fxOverrides.rate })
      .from(fxOverrides)
      .where(eq(fxOverrides.groupId, group.id)),
  ]);

  return {
    group: {
      name: group.name,
      baseCurrency: group.baseCurrency,
      createdAt: group.createdAt.toISOString(),
    },
    members: sortMembers(memberRows),
    expenses: expenseRows.map(toExpenseRecord),
    settlements: settlementRows.map(toSettlementRecord),
    fxOverrides: Object.fromEntries(fxOverrideRows.map((r) => [r.currency, r.rate])),
  };
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export async function addMember(db: SplitDb, secret: string, rawName: string): Promise<Member> {
  const group = await requireGroup(db, secret);
  const name = cleanText(rawName, "name", LIMITS.memberName);

  const existing = await memberIdSet(db, group.id);
  if (existing.size >= LIMITS.maxMembers) {
    throw new SplitError(`a group can have at most ${LIMITS.maxMembers} people`);
  }

  try {
    const [row] = await db
      .insert(members)
      .values({ groupId: group.id, name })
      .returning({ id: members.id, name: members.name });
    return row;
  } catch (err) {
    if (isUniqueViolation(err)) throw new SplitError("someone in this group already has that name");
    throw err;
  }
}

export async function renameMember(
  db: SplitDb,
  secret: string,
  memberId: string,
  rawName: string
): Promise<Member> {
  const group = await requireGroup(db, secret);
  requireId(memberId, "Member");
  const name = cleanText(rawName, "name", LIMITS.memberName);

  try {
    const [row] = await db
      .update(members)
      .set({ name })
      .where(and(eq(members.id, memberId), eq(members.groupId, group.id)))
      .returning({ id: members.id, name: members.name });
    if (!row) throw new NotFoundError("Member not found");
    return row;
  } catch (err) {
    if (isUniqueViolation(err)) throw new SplitError("someone in this group already has that name");
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export async function addExpense(
  db: SplitDb,
  secret: string,
  input: ExpenseInput
): Promise<ExpenseRecord> {
  const group = await requireGroup(db, secret);
  const valid = await memberIdSet(db, group.id);
  const values = prepareExpense(input, group.baseCurrency, valid);

  const [row] = await db
    .insert(expenses)
    .values({ ...values, groupId: group.id, createdBy: input.createdBy ?? null })
    .returning();
  return toExpenseRecord(row);
}

export async function updateExpense(
  db: SplitDb,
  secret: string,
  expenseId: string,
  input: ExpenseInput
): Promise<ExpenseRecord> {
  const group = await requireGroup(db, secret);
  requireId(expenseId, "Expense");
  const valid = await memberIdSet(db, group.id);
  const values = prepareExpense(input, group.baseCurrency, valid);

  // createdBy is deliberately not updatable: it records who first entered it.
  const [row] = await db
    .update(expenses)
    .set({ ...values, updatedAt: new Date() })
    .where(
      and(
        eq(expenses.id, expenseId),
        eq(expenses.groupId, group.id),
        isNull(expenses.deletedAt)
      )
    )
    .returning();
  if (!row) throw new NotFoundError("Expense not found");
  return toExpenseRecord(row);
}

async function setExpenseDeleted(db: SplitDb, secret: string, expenseId: string, deleted: boolean) {
  const group = await requireGroup(db, secret);
  requireId(expenseId, "Expense");
  const [row] = await db
    .update(expenses)
    .set({ deletedAt: deleted ? new Date() : null })
    .where(and(eq(expenses.id, expenseId), eq(expenses.groupId, group.id)))
    .returning();
  if (!row) throw new NotFoundError("Expense not found");
  return toExpenseRecord(row);
}

export const deleteExpense = (db: SplitDb, secret: string, id: string) =>
  setExpenseDeleted(db, secret, id, true);

export const restoreExpense = (db: SplitDb, secret: string, id: string) =>
  setExpenseDeleted(db, secret, id, false);

// ---------------------------------------------------------------------------
// Settlements
// ---------------------------------------------------------------------------

export async function addSettlement(
  db: SplitDb,
  secret: string,
  input: SettlementInput
): Promise<SettlementRecord> {
  const group = await requireGroup(db, secret);
  const valid = await memberIdSet(db, group.id);

  const amountMinor = cleanAmount(input.amountMinor);
  const date = cleanDate(input.date);
  if (input.from === input.to) throw new SplitError("a settlement needs two different people");
  assertMembers([input.from, input.to, input.createdBy], valid);

  const [row] = await db
    .insert(settlements)
    .values({
      groupId: group.id,
      fromMember: input.from,
      toMember: input.to,
      amountMinor,
      date,
      createdBy: input.createdBy ?? null,
    })
    .returning();
  return toSettlementRecord(row);
}

export async function deleteSettlement(
  db: SplitDb,
  secret: string,
  settlementId: string
): Promise<SettlementRecord> {
  const group = await requireGroup(db, secret);
  requireId(settlementId, "Settlement");
  const [row] = await db
    .update(settlements)
    .set({ deletedAt: new Date() })
    .where(and(eq(settlements.id, settlementId), eq(settlements.groupId, group.id)))
    .returning();
  if (!row) throw new NotFoundError("Settlement not found");
  return toSettlementRecord(row);
}

// ---------------------------------------------------------------------------
// FX overrides
// ---------------------------------------------------------------------------

/**
 * A saved default exchange rate for one currency in one group, so a traveler
 * only has to look up (say) COP -> CAD once per trip instead of on every
 * expense. Only changes what new expenses default to: expense.fxRate is
 * still frozen at save time regardless, per the existing invariant.
 */
export async function setFxOverride(
  db: SplitDb,
  secret: string,
  currency: string,
  rawRate: number
): Promise<{ currency: string; rate: number }> {
  const group = await requireGroup(db, secret);
  const cleanedCurrency = cleanCurrency(currency);

  if (cleanedCurrency === group.baseCurrency) {
    throw new SplitError("an override for the group's own base currency makes no sense");
  }
  if (typeof rawRate !== "number" || !Number.isFinite(rawRate) || rawRate <= 0) {
    throw new SplitError("rate must be a positive number");
  }

  await db
    .insert(fxOverrides)
    .values({ groupId: group.id, currency: cleanedCurrency, rate: rawRate })
    .onConflictDoUpdate({
      target: [fxOverrides.groupId, fxOverrides.currency],
      set: { rate: rawRate, updatedAt: new Date() },
    });

  return { currency: cleanedCurrency, rate: rawRate };
}
