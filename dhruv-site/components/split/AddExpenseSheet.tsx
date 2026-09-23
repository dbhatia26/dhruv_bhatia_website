"use client";

import { FormEvent, useEffect, useState } from "react";
import { Sheet } from "./ui/Sheet";
import { TextField } from "./ui/TextField";
import { NumberField } from "./ui/NumberField";
import { Select } from "./ui/Select";
import { SegmentedControl } from "./ui/SegmentedControl";
import { Button } from "./ui/Button";
import { CurrencyPicker } from "./CurrencyPicker";
import { addExpense, updateExpense, getFxRate, setFxOverride, ApiError } from "@/lib/split/ui/api";
import { reconcileExactSplit, reconcilePercentSplit } from "@/lib/split/ui/splitInput";
import { toMinor, fromMinor } from "@/lib/split/currency";
import type { SplitMode } from "@/lib/split";
import type { Expense, Member } from "@/lib/split/ui/types";

interface AddExpenseSheetProps {
  open: boolean;
  onClose: () => void;
  secret: string;
  members: Member[];
  baseCurrency: string;
  createdBy: string | null;
  /** Null adds a new expense; an Expense edits it in place. */
  editing: Expense | null;
  /** Saved default exchange rates by currency, checked before hitting Frankfurter. */
  fxOverrides: Record<string, number>;
  onSaved: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

function initialPerMemberRaw(expense: Expense | null): Record<string, string> {
  if (!expense) return {};
  switch (expense.split.mode) {
    case "exact":
      return Object.fromEntries(
        Object.entries(expense.split.amounts).map(([id, minor]) => [
          id,
          String(fromMinor(minor, expense.currency)),
        ])
      );
    case "percent":
      return Object.fromEntries(
        Object.entries(expense.split.percents).map(([id, p]) => [id, String(p)])
      );
    case "shares":
      return Object.fromEntries(
        Object.entries(expense.split.shares).map(([id, s]) => [id, String(s)])
      );
    default:
      return {};
  }
}

export function AddExpenseSheet({
  open,
  onClose,
  secret,
  members,
  baseCurrency,
  createdBy,
  editing,
  fxOverrides,
  onSaved,
}: AddExpenseSheetProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(baseCurrency);
  const [date, setDate] = useState(today());
  const [paidBy, setPaidBy] = useState("");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [participants, setParticipants] = useState<string[]>([]);
  const [perMemberRaw, setPerMemberRaw] = useState<Record<string, string>>({});
  const [fxRate, setFxRate] = useState("1");
  const [fxLoading, setFxLoading] = useState(false);
  // True once the user picks a currency themselves, so opening an edit sheet
  // doesn't clobber the expense's already-frozen rate with a fresh lookup.
  const [currencyDirty, setCurrencyDirty] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDescription(editing?.description ?? "");
    setAmount(editing ? String(fromMinor(editing.amountMinor, editing.currency)) : "");
    setCurrency(editing?.currency ?? baseCurrency);
    setDate(editing?.date ?? today());
    setPaidBy(editing?.paidBy ?? createdBy ?? members[0]?.id ?? "");
    setSplitMode(editing?.split.mode ?? "equal");
    setParticipants(
      editing?.split.mode === "equal" ? editing.split.participants : members.map((m) => m.id)
    );
    setPerMemberRaw(initialPerMemberRaw(editing));
    setFxRate(editing ? String(editing.fxRate) : "1");
    setCurrencyDirty(false);
    setSaveAsDefault(false);
    setError(null);
  }, [open, editing, members, baseCurrency, createdBy]);

  useEffect(() => {
    if (!open) return;
    if (currency === baseCurrency) {
      setFxRate("1");
      return;
    }
    // Editing an expense whose currency hasn't been touched yet: keep the
    // rate it was actually saved with, rather than overwriting it with
    // today's override or live rate.
    if (editing && !currencyDirty) return;

    const override = fxOverrides[currency];
    if (override !== undefined) {
      setFxRate(String(override));
      return;
    }

    let cancelled = false;
    setFxLoading(true);
    getFxRate(currency, baseCurrency)
      .then((rate) => {
        if (!cancelled) setFxRate(String(rate.rate));
      })
      .catch(() => {
        // Leave whatever rate is there (or the manual-override default) if the
        // provider has no rate for this pair; the field stays editable either way.
      })
      .finally(() => {
        if (!cancelled) setFxLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, currency, baseCurrency, editing, currencyDirty, fxOverrides]);

  const handleCurrencyChange = (value: string) => {
    setCurrencyDirty(true);
    setCurrency(value);
  };

  const toggleParticipant = (id: string) => {
    setParticipants((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const setPerMember = (id: string, value: string) => {
    setPerMemberRaw((prev) => ({ ...prev, [id]: value }));
  };

  const amountMinor = toMinor(Number(amount || "0"), currency);

  const usingSavedRate =
    !fxLoading && currency !== baseCurrency && (!editing || currencyDirty) && fxOverrides[currency] !== undefined;

  const reconciliation =
    splitMode === "exact"
      ? reconcileExactSplit(amountMinor, currency, perMemberRaw)
      : splitMode === "percent"
        ? reconcilePercentSplit(perMemberRaw)
        : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) return setError("Add a description");
    if (amountMinor <= 0) return setError("Enter an amount greater than zero");
    if (!paidBy) return setError("Choose who paid");

    let split;
    if (splitMode === "equal") {
      if (participants.length === 0) return setError("Pick at least one person");
      split = { mode: "equal" as const, participants };
    } else if (splitMode === "shares") {
      const shares: Record<string, number> = {};
      for (const [id, raw] of Object.entries(perMemberRaw)) {
        const value = Number(raw.trim());
        if (raw.trim() !== "" && value > 0) shares[id] = value;
      }
      if (Object.keys(shares).length === 0) return setError("Give at least one person a share");
      split = { mode: "shares" as const, shares };
    } else {
      if (!reconciliation?.ok || !reconciliation.spec) {
        return setError(reconciliation?.hint ?? "Amounts don't add up yet");
      }
      split = reconciliation.spec;
    }

    const fxRateNum = currency === baseCurrency ? 1 : Number(fxRate);
    if (!Number.isFinite(fxRateNum) || fxRateNum <= 0) {
      return setError("Enter a valid exchange rate");
    }

    setSubmitting(true);
    try {
      const input = {
        description: description.trim(),
        amountMinor,
        currency,
        fxRate: fxRateNum,
        paidBy,
        split,
        date,
        createdBy,
      };
      if (editing) {
        await updateExpense(secret, editing.id, input);
      } else {
        await addExpense(secret, input);
      }
      if (saveAsDefault && currency !== baseCurrency) {
        // Best-effort: the expense is already saved either way. Losing the
        // override isn't worth blocking on or re-showing the sheet for.
        await setFxOverride(secret, currency, fxRateNum).catch(() => {});
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={editing ? "Edit expense" : "Add expense"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dinner at..."
          maxLength={200}
          required
        />
        <div className="flex gap-2">
          <NumberField
            label="Amount"
            value={amount}
            onChange={setAmount}
            currency={currency}
            prefix={currency}
          />
          <CurrencyPicker value={currency} onChange={handleCurrencyChange} />
        </div>
        {currency !== baseCurrency && (
          <div className="flex flex-col gap-2">
            <NumberField
              label={`Exchange rate to ${baseCurrency}${fxLoading ? " (fetching...)" : usingSavedRate ? " (saved rate)" : ""}`}
              value={fxRate}
              onChange={setFxRate}
              decimals={6}
              placeholder="1.00"
            />
            <label className="flex min-h-9 items-center gap-2 text-sm text-rt-ink-body">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
                className="h-4 w-4 accent-rt-ink-strong"
              />
              Save as this trip&apos;s default rate for {currency}
            </label>
          </div>
        )}
        <Select label="Paid by" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <SegmentedControl
          label="Split mode"
          value={splitMode}
          onChange={setSplitMode}
          options={[
            { value: "equal", label: "Equal" },
            { value: "exact", label: "Exact" },
            { value: "percent", label: "Percent" },
            { value: "shares", label: "Shares" },
          ]}
        />

        {splitMode === "equal" && (
          <div className="flex flex-col gap-2">
            {members.map((m) => (
              <label key={m.id} className="flex min-h-9 items-center gap-2 text-sm text-rt-ink-body">
                <input
                  type="checkbox"
                  checked={participants.includes(m.id)}
                  onChange={() => toggleParticipant(m.id)}
                  className="h-4 w-4 accent-rt-ink-strong"
                />
                {m.name}
              </label>
            ))}
          </div>
        )}

        {(splitMode === "exact" || splitMode === "percent" || splitMode === "shares") && (
          <div className="flex flex-col gap-2">
            {members.map((m) => (
              <NumberField
                key={m.id}
                label={m.name}
                value={perMemberRaw[m.id] ?? ""}
                onChange={(v) => setPerMember(m.id, v)}
                currency={splitMode === "exact" ? currency : undefined}
                decimals={splitMode === "exact" ? undefined : 2}
                prefix={splitMode === "exact" ? currency : splitMode === "percent" ? "%" : undefined}
              />
            ))}
            {reconciliation && (
              <p className={reconciliation.ok ? "text-sm text-rt-credit" : "text-sm text-rt-ink-muted"}>
                {reconciliation.hint}
              </p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-rt-debit">{error}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : editing ? "Save changes" : "Add expense"}
        </Button>
      </form>
    </Sheet>
  );
}
