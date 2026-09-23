"use client";

import { use, useState } from "react";
import { useGroup } from "@/lib/split/ui/useGroup";
import { getIdentity } from "@/lib/split/ui/storage";
import { deleteExpense, restoreExpense, ApiError } from "@/lib/split/ui/api";
import { IdentityPicker } from "@/components/split/IdentityPicker";
import { MemberList } from "@/components/split/MemberList";
import { ExpenseList } from "@/components/split/ExpenseList";
import { BalancesPanel } from "@/components/split/BalancesPanel";
import { AddExpenseSheet } from "@/components/split/AddExpenseSheet";
import { SettleUpSheet } from "@/components/split/SettleUpSheet";
import { Button } from "@/components/split/ui/Button";
import type { Expense } from "@/lib/split/ui/types";

interface SettlePrefill {
  from: string;
  to: string;
  amountMinor: number;
}

export default function GroupPage({ params }: { params: Promise<{ secret: string }> }) {
  const { secret } = use(params);
  const { state, error, loading, refresh } = useGroup(secret);

  const [identity, setIdentity] = useState<string | null>(() => getIdentity(secret));
  const [addOpen, setAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [settleOpen, setSettleOpen] = useState(false);
  const [settlePrefill, setSettlePrefill] = useState<SettlePrefill | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-sm text-rt-ink-muted">
        Loading…
      </main>
    );
  }

  if (error || !state) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-sm text-rt-ink-strong">{error ?? "Group not found"}</p>
        <p className="text-sm text-rt-ink-muted">Double-check the link.</p>
      </main>
    );
  }

  if (!identity) {
    return (
      <IdentityPicker
        secret={secret}
        members={state.members}
        onDone={setIdentity}
        onMemberAdded={() => refresh()}
      />
    );
  }

  const openAdd = (expense: Expense | null) => {
    setEditingExpense(expense);
    setAddOpen(true);
  };

  const openSettle = (from: string, to: string, amountMinor: number) => {
    setSettlePrefill({ from, to, amountMinor });
    setSettleOpen(true);
  };

  const handleDelete = async (expense: Expense) => {
    setActionError(null);
    try {
      await deleteExpense(secret, expense.id);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  };

  const handleRestore = async (expense: Expense) => {
    setActionError(null);
    try {
      await restoreExpense(secret, expense.id);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 py-8">
      <header>
        <p className="text-xs font-mono uppercase tracking-widest text-rt-ink-faint">
          {state.group.baseCurrency}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-rt-ink-strong">{state.group.name}</h1>
      </header>

      <section>
        <h2 className="mb-2 text-xs font-mono uppercase tracking-wider text-rt-ink-faint">People</h2>
        <MemberList secret={secret} members={state.members} onChange={() => refresh()} />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-mono uppercase tracking-wider text-rt-ink-faint">Balances</h2>
        <BalancesPanel
          balances={state.balances}
          members={state.members}
          baseCurrency={state.group.baseCurrency}
          onSettle={openSettle}
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-rt-ink-faint">Expenses</h2>
          <Button size="sm" onClick={() => openAdd(null)}>
            + Add expense
          </Button>
        </div>
        <ExpenseList
          expenses={state.expenses}
          members={state.members}
          baseCurrency={state.group.baseCurrency}
          onEdit={openAdd}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      </section>

      {actionError && <p className="text-sm text-rt-debit">{actionError}</p>}

      <AddExpenseSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        secret={secret}
        members={state.members}
        baseCurrency={state.group.baseCurrency}
        createdBy={identity}
        editing={editingExpense}
        fxOverrides={state.fxOverrides}
        onSaved={refresh}
      />
      <SettleUpSheet
        open={settleOpen}
        onClose={() => setSettleOpen(false)}
        secret={secret}
        members={state.members}
        baseCurrency={state.group.baseCurrency}
        createdBy={identity}
        prefill={settlePrefill}
        onSettled={refresh}
      />
    </main>
  );
}
