import clsx from "clsx";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { formatMoney } from "@/lib/split/currency";
import type { Expense } from "@/lib/split/ui/types";

interface ExpenseRowProps {
  expense: Expense;
  paidByName: string;
  baseCurrency: string;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
}

const SPLIT_LABELS: Record<Expense["split"]["mode"], string> = {
  equal: "Equal",
  exact: "Exact",
  percent: "Percent",
  shares: "Shares",
};

export function ExpenseRow({
  expense,
  paidByName,
  baseCurrency,
  onEdit,
  onDelete,
  onRestore,
}: ExpenseRowProps) {
  const deleted = Boolean(expense.deletedAt);
  return (
    <div className={clsx("flex items-center gap-3 py-3", deleted && "opacity-50")}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-rt-ink-strong">{expense.description}</p>
          <Badge>{SPLIT_LABELS[expense.split.mode]}</Badge>
          {deleted && <Badge tone="warn">Deleted</Badge>}
        </div>
        <p className="text-xs text-rt-ink-muted">
          {paidByName} paid {formatMoney(expense.amountMinor, expense.currency)}
          {expense.currency !== baseCurrency &&
            ` (${formatMoney(expense.baseAmountMinor, baseCurrency)})`}
          {" · "}
          {expense.date}
        </p>
      </div>
      {deleted ? (
        <Button variant="secondary" size="sm" onClick={onRestore}>
          Restore
        </Button>
      ) : (
        <>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </>
      )}
    </div>
  );
}
