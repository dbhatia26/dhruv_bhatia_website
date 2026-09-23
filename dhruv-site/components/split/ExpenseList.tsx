"use client";

import { EmptyState } from "./ui/EmptyState";
import { ExpenseRow } from "./ExpenseRow";
import type { Expense, Member } from "@/lib/split/ui/types";

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  baseCurrency: string;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onRestore: (expense: Expense) => void;
}

export function ExpenseList({
  expenses,
  members,
  baseCurrency,
  onEdit,
  onDelete,
  onRestore,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return <EmptyState title="No expenses yet" body="Add the first one to start tracking who owes what." />;
  }

  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "Someone";
  // The API returns oldest first (for stable balance computation); show newest first.
  const newestFirst = [...expenses].reverse();

  return (
    <div className="flex flex-col gap-2">
      {newestFirst.map((expense) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          paidByName={nameOf(expense.paidBy)}
          baseCurrency={baseCurrency}
          onEdit={() => onEdit(expense)}
          onDelete={() => onDelete(expense)}
          onRestore={() => onRestore(expense)}
        />
      ))}
    </div>
  );
}
