"use client";

import { FormEvent, useState } from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { Avatar } from "./ui/Avatar";
import { addMember, renameMember, ApiError } from "@/lib/split/ui/api";
import type { Member } from "@/lib/split/ui/types";

interface MemberListProps {
  secret: string;
  members: Member[];
  onChange: (members: Member[]) => void;
}

/** Members can be added and renamed, not removed, per the locked v1 decision. */
export function MemberList({ secret, members, onChange }: MemberListProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const startRename = (m: Member) => {
    setRenamingId(m.id);
    setRenameValue(m.name);
    setError(null);
  };

  const submitRename = async (e: FormEvent) => {
    e.preventDefault();
    if (!renamingId) return;
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await renameMember(secret, renamingId, trimmed);
      onChange(members.map((m) => (m.id === updated.id ? updated : m)));
      setRenamingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const submitAdd = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const member = await addMember(secret, trimmed);
      onChange([...members, member]);
      setNewName("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-3">
          <Avatar id={m.id} name={m.name} size="sm" />
          {renamingId === m.id ? (
            <form onSubmit={submitRename} className="flex flex-1 gap-2">
              <TextField
                label={`Rename ${m.name}`}
                hideLabel
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                maxLength={40}
                autoFocus
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={busy}>
                Save
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setRenamingId(null)}>
                Cancel
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => startRename(m)}
              className="min-h-9 flex-1 text-left text-sm text-rt-ink-strong hover:text-rt-accent"
            >
              {m.name}
            </button>
          )}
        </div>
      ))}
      <form onSubmit={submitAdd} className="flex gap-2 pt-1">
        <TextField
          label="Add someone"
          hideLabel
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add someone"
          maxLength={40}
          className="flex-1"
        />
        <Button type="submit" variant="secondary" size="sm" disabled={busy || !newName.trim()}>
          + Add
        </Button>
      </form>
      {error && <p className="text-sm text-rt-debit">{error}</p>}
    </div>
  );
}
