/** Thin fetch wrappers over /api/split/*. Client-only; every call throws ApiError on non-2xx. */
import type { SplitSpec } from "@/lib/split";
import type { Member, Expense, Settlement, GroupState } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/split${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : "Something went wrong";
    throw new ApiError(res.status, message);
  }
  return body as T;
}

export function createGroup(input: { name: string; baseCurrency: string; memberNames: string[] }) {
  return request<{ secret: string; members: Member[] }>("/groups", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getGroup(secret: string) {
  return request<GroupState>(`/groups/${secret}`);
}

export function addMember(secret: string, name: string) {
  return request<Member>(`/groups/${secret}/members`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function renameMember(secret: string, id: string, name: string) {
  return request<Member>(`/groups/${secret}/members/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export interface ExpenseInput {
  description: string;
  amountMinor: number;
  currency: string;
  fxRate: number;
  paidBy: string;
  split: SplitSpec;
  date: string;
  createdBy?: string | null;
}

export function addExpense(secret: string, input: ExpenseInput) {
  return request<Expense>(`/groups/${secret}/expenses`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateExpense(secret: string, id: string, input: ExpenseInput) {
  return request<Expense>(`/groups/${secret}/expenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteExpense(secret: string, id: string) {
  return request<Expense>(`/groups/${secret}/expenses/${id}`, { method: "DELETE" });
}

export function restoreExpense(secret: string, id: string) {
  return request<Expense>(`/groups/${secret}/expenses/${id}/restore`, { method: "POST" });
}

export interface SettlementInput {
  from: string;
  to: string;
  amountMinor: number;
  date: string;
  createdBy?: string | null;
}

export function addSettlement(secret: string, input: SettlementInput) {
  return request<Settlement>(`/groups/${secret}/settlements`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteSettlement(secret: string, id: string) {
  return request<Settlement>(`/groups/${secret}/settlements/${id}`, { method: "DELETE" });
}

export function getFxRate(from: string, to: string) {
  return request<{ from: string; to: string; rate: number; date: string }>(
    `/fx?from=${from}&to=${to}`
  );
}
