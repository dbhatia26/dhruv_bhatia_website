import {
  pgSchema,
  uuid,
  text,
  varchar,
  bigint,
  doublePrecision,
  jsonb,
  date,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { SplitSpec } from "../types";

/**
 * Every table for this tool lives in its own Postgres schema, so the shared
 * site database can hold other tools later without naming collisions.
 */
export const splitSchema = pgSchema("split");

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
};

export const groups = splitSchema.table(
  "groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Unguessable token in the share link. Never expose `id` publicly. */
    secret: text("secret").notNull(),
    name: text("name").notNull(),
    baseCurrency: varchar("base_currency", { length: 3 }).notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("groups_secret_idx").on(t.secret)]
);

export const members = splitSchema.table(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    ...timestamps,
  },
  (t) => [
    index("members_group_idx").on(t.groupId),
    // Case-insensitive, so "Sam" and "sam" cannot both exist in one group.
    uniqueIndex("members_group_name_idx").on(t.groupId, sql`lower(${t.name})`),
  ]
);

export const expenses = splitSchema.table(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    /** In the expense's own currency, integer minor units. */
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    /** Base units per 1 unit of `currency`, frozen when the expense was saved. */
    fxRate: doublePrecision("fx_rate").notNull(),
    /** Converted once at save time and stored. Never recomputed. */
    baseAmountMinor: bigint("base_amount_minor", { mode: "number" }).notNull(),
    paidBy: uuid("paid_by")
      .notNull()
      .references(() => members.id),
    /** The split exactly as entered, in the expense's own currency. */
    split: jsonb("split").$type<SplitSpec>().notNull(),
    date: date("date", { mode: "string" }).notNull(),
    /** Who entered it, from the device identity picker. Optional. */
    createdBy: uuid("created_by").references(() => members.id),
    ...timestamps,
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("expenses_group_idx").on(t.groupId)]
);

export const settlements = splitSchema.table(
  "settlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    fromMember: uuid("from_member")
      .notNull()
      .references(() => members.id),
    toMember: uuid("to_member")
      .notNull()
      .references(() => members.id),
    /** Always in the group's base currency. */
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    date: date("date", { mode: "string" }).notNull(),
    createdBy: uuid("created_by").references(() => members.id),
    ...timestamps,
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("settlements_group_idx").on(t.groupId)]
);

export const fxOverrides = splitSchema.table(
  "fx_overrides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    currency: varchar("currency", { length: 3 }).notNull(),
    /** Base units per 1 unit of `currency`. Same convention as Expense.fxRate. */
    rate: doublePrecision("rate").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("fx_overrides_group_currency_idx").on(t.groupId, t.currency)]
);

export const schema = { groups, members, expenses, settlements, fxOverrides };
