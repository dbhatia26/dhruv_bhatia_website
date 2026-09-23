/**
 * Server-side only. Import from "@/lib/split/db" in route handlers.
 * Never import this from a client component: keep "@/lib/split" (pure math)
 * and this module separate so the database driver never reaches the browser.
 */
export { getDb, type SplitDb } from "./client";
export {
  createGroup,
  loadGroup,
  addMember,
  renameMember,
  addExpense,
  updateExpense,
  deleteExpense,
  restoreExpense,
  addSettlement,
  deleteSettlement,
  setFxOverride,
  NotFoundError,
  LIMITS,
  type GroupInfo,
  type GroupState,
  type Member,
  type ExpenseRecord,
  type SettlementRecord,
  type ExpenseInput,
  type SettlementInput,
} from "./queries";
