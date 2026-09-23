"use client";

import { FormEvent, useState } from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { Avatar } from "./ui/Avatar";
import { addMember, ApiError } from "@/lib/split/ui/api";
import { setIdentity } from "@/lib/split/ui/storage";
import type { Member } from "@/lib/split/ui/types";

interface IdentityPickerProps {
  secret: string;
  members: Member[];
  onDone: (memberId: string) => void;
  onMemberAdded: (member: Member) => void;
}

/** Blocking full-screen prompt shown once per device per group, per the locked "identity without accounts" decision. */
export function IdentityPicker({ secret, members, onDone, onMemberAdded }: IdentityPickerProps) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = (memberId: string) => {
    setIdentity(secret, memberId);
    onDone(memberId);
  };

  const handleAddNew = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAdding(true);
    setError(null);
    try {
      const member = await addMember(secret, trimmed);
      onMemberAdded(member);
      choose(member.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-rt-bg p-4">
      <div className="w-full max-w-sm rounded-2xl border border-rt-border bg-rt-surface p-5">
        <h1 className="mb-1 text-lg font-semibold text-rt-ink-strong">Who are you?</h1>
        <p className="mb-4 text-sm text-rt-ink-muted">Remembered on this device only.</p>
        <div className="mb-4 flex flex-col gap-2">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => choose(m.id)}
              className="flex min-h-11 items-center gap-3 rounded-lg border border-rt-border bg-rt-surface-raised px-3 py-2.5 text-left text-sm text-rt-ink-strong hover:border-rt-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rt-accent"
            >
              <Avatar id={m.id} name={m.name} size="sm" />
              {m.name}
            </button>
          ))}
        </div>
        <form onSubmit={handleAddNew} className="flex gap-2">
          <TextField
            label="Someone else"
            hideLabel
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="I'm not on this list"
            maxLength={40}
            className="flex-1"
          />
          <Button type="submit" variant="secondary" disabled={adding || !newName.trim()}>
            Join
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-rt-debit">{error}</p>}
      </div>
    </div>
  );
}
