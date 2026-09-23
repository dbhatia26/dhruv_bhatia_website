/**
 * Structural validation at the API boundary: types and required fields only.
 * Business rules (name length, currency code format, split arithmetic, member
 * existence) already live in lib/split/db/queries.ts and stay there as the
 * single source of truth, so these schemas do not duplicate them.
 */
import { z } from "zod";

export const splitSpecSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("equal"), participants: z.array(z.string()) }),
  z.object({ mode: z.literal("exact"), amounts: z.record(z.string(), z.number()) }),
  z.object({ mode: z.literal("percent"), percents: z.record(z.string(), z.number()) }),
  z.object({ mode: z.literal("shares"), shares: z.record(z.string(), z.number()) }),
]);

export const createGroupSchema = z.object({
  name: z.string(),
  baseCurrency: z.string(),
  memberNames: z.array(z.string()).min(1),
});

export const memberNameSchema = z.object({
  name: z.string(),
});

export const expenseInputSchema = z.object({
  description: z.string(),
  amountMinor: z.number(),
  currency: z.string(),
  fxRate: z.number(),
  paidBy: z.string(),
  split: splitSpecSchema,
  date: z.string(),
  createdBy: z.string().nullable().optional(),
});

export const settlementInputSchema = z.object({
  from: z.string(),
  to: z.string(),
  amountMinor: z.number(),
  date: z.string(),
  createdBy: z.string().nullable().optional(),
});
