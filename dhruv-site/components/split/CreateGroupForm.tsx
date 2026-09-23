"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { CurrencyPicker } from "./CurrencyPicker";
import { createGroup, ApiError } from "@/lib/split/ui/api";
import { addDeviceGroup } from "@/lib/split/ui/storage";

export function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [baseCurrency, setBaseCurrency] = useState("CAD");
  const [memberNames, setMemberNames] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateMember = (i: number, value: string) => {
    setMemberNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
  };

  const addMemberRow = () => setMemberNames((prev) => [...prev, ""]);
  const removeMemberRow = (i: number) =>
    setMemberNames((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedNames = memberNames.map((n) => n.trim()).filter(Boolean);
    if (cleanedNames.length === 0) {
      setError("Add at least one person");
      return;
    }

    setSubmitting(true);
    try {
      const trimmedName = name.trim();
      const result = await createGroup({ name: trimmedName, baseCurrency, memberNames: cleanedNames });
      addDeviceGroup({ secret: result.secret, name: trimmedName, joinedAt: new Date().toISOString() });
      router.push(`/tools/running-tab/${result.secret}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="Trip name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Iceland 2026"
        required
        maxLength={80}
      />
      <CurrencyPicker value={baseCurrency} onChange={setBaseCurrency} />
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-rt-ink-faint">Who&apos;s going</span>
        {memberNames.map((memberName, i) => (
          <div key={i} className="flex gap-2">
            <TextField
              label={`Person ${i + 1}`}
              hideLabel
              value={memberName}
              onChange={(e) => updateMember(i, e.target.value)}
              placeholder={`Person ${i + 1}`}
              maxLength={40}
              className="flex-1"
            />
            {memberNames.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMemberRow(i)}
                aria-label={`Remove person ${i + 1}`}
              >
                &times;
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={addMemberRow}>
          + Add person
        </Button>
      </div>
      {error && <p className="text-sm text-rt-debit">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating…" : "Start the trip"}
      </Button>
    </form>
  );
}
