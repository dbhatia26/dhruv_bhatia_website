"use client";

import { useState } from "react";
import clsx from "clsx";
import { SegmentedControl } from "./ui/SegmentedControl";
import { Card } from "./ui/Card";
import { GradientBlob } from "./ui/GradientBlob";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { formatMoney } from "@/lib/split/currency";
import type { Balances, Member } from "@/lib/split/ui/types";

interface BalancesPanelProps {
  balances: Balances;
  members: Member[];
  baseCurrency: string;
  currentMemberId: string | null;
  onSettle: (from: string, to: string, amountMinor: number) => void;
}

export function BalancesPanel({
  balances,
  members,
  baseCurrency,
  currentMemberId,
  onSettle,
}: BalancesPanelProps) {
  const [view, setView] = useState<"simplified" | "raw">("simplified");
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "Someone";
  const transfers = view === "simplified" ? balances.simplified : balances.raw;
  const heroAmount = currentMemberId ? (balances.net[currentMemberId] ?? 0) : null;

  return (
    <div className="flex flex-col gap-4">
      {heroAmount !== null && (
        <Card className="relative overflow-hidden">
          <GradientBlob className="-right-16 -top-20 h-56 w-56" />
          <div className="relative">
            <p className="text-sm text-rt-ink-muted">
              {heroAmount === 0 ? "You're settled up" : heroAmount > 0 ? "You're owed" : "You owe"}
            </p>
            {heroAmount !== 0 && (
              <p className="mt-1 font-mono text-4xl font-semibold text-rt-ink-strong">
                {formatMoney(Math.abs(heroAmount), baseCurrency)}
              </p>
            )}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {members.map((m) => {
          const amount = balances.net[m.id] ?? 0;
          return (
            <div key={m.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar id={m.id} name={m.name} size="sm" />
                <span className="text-sm text-rt-ink-strong">{m.name}</span>
              </div>
              <span
                className={clsx(
                  "font-mono text-sm",
                  amount > 0 ? "text-rt-credit" : amount < 0 ? "text-rt-debit" : "text-rt-ink-muted"
                )}
              >
                {amount === 0
                  ? "settled up"
                  : `${formatMoney(Math.abs(amount), baseCurrency)} ${amount > 0 ? "owed" : "owes"}`}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-rt-ink-faint">
        Totals are in {baseCurrency} at the rate entered for each expense. They won&apos;t match your
        card statement exactly, since banks apply their own rates and fees.
      </p>

      {transfers.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-rt-ink-body">Settle up</span>
            <SegmentedControl
              label="Balances view"
              value={view}
              onChange={setView}
              options={[
                { value: "simplified", label: "Simplified" },
                { value: "raw", label: "Raw" },
              ]}
            />
          </div>
          <div className="flex flex-col divide-y divide-rt-border rounded-2xl border border-rt-border">
            {transfers.map((t, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-rt-ink-body">
                  <span className="text-rt-ink-strong">{nameOf(t.from)}</span> owes{" "}
                  <span className="text-rt-ink-strong">{nameOf(t.to)}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-rt-ink-strong">
                    {formatMoney(t.amountMinor, baseCurrency)}
                  </span>
                  <Button size="sm" onClick={() => onSettle(t.from, t.to, t.amountMinor)}>
                    Settle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
