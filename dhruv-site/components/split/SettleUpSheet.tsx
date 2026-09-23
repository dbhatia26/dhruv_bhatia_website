"use client";

import { FormEvent, useEffect, useState } from "react";
import { Sheet } from "./ui/Sheet";
import { Select } from "./ui/Select";
import { NumberField } from "./ui/NumberField";
import { TextField } from "./ui/TextField";
import { Button } from "./ui/Button";
import { addSettlement, ApiError } from "@/lib/split/ui/api";
import { fromMinor, toMinor } from "@/lib/split/currency";
import type { Member } from "@/lib/split/ui/types";

interface SettleUpSheetProps {
  open: boolean;
  onClose: () => void;
  secret: string;
  members: Member[];
  baseCurrency: string;
  createdBy: string | null;
  /** Pre-fills from a balances row; still editable in case of a partial settlement. */
  prefill: { from: string; to: string; amountMinor: number } | null;
  onSettled: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function SettleUpSheet({
  open,
  onClose,
  secret,
  members,
  baseCurrency,
  createdBy,
  prefill,
  onSettled,
}: SettleUpSheetProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFrom(prefill?.from ?? members[0]?.id ?? "");
    setTo(prefill?.to ?? members[1]?.id ?? "");
    setAmount(prefill ? String(fromMinor(prefill.amountMinor, baseCurrency)) : "");
    setDate(today());
    setError(null);
  }, [open, prefill, members, baseCurrency]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (from === to) return setError("Pick two different people");

    const amountMinor = toMinor(Number(amount || "0"), baseCurrency);
    if (amountMinor <= 0) return setError("Enter an amount greater than zero");

    setSubmitting(true);
    try {
      await addSettlement(secret, { from, to, amountMinor, date, createdBy });
      onSettled();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Settle up">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select label="From" value={from} onChange={(e) => setFrom(e.target.value)}>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
        <Select label="To" value={to} onChange={(e) => setTo(e.target.value)}>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
        <NumberField
          label={`Amount (${baseCurrency})`}
          value={amount}
          onChange={setAmount}
          currency={baseCurrency}
          prefix={baseCurrency}
        />
        <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        {error && <p className="text-sm text-rt-debit">{error}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Recording…" : "Record settlement"}
        </Button>
      </form>
    </Sheet>
  );
}
