"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreateGroupForm } from "@/components/split/CreateGroupForm";
import { ThemeToggle } from "@/components/split/ThemeToggle";
import { GradientBlob } from "@/components/split/ui/GradientBlob";
import { getDeviceGroups, type DeviceGroup } from "@/lib/split/ui/storage";

export default function RunningTabHome() {
  const [groups, setGroups] = useState<DeviceGroup[]>([]);

  useEffect(() => {
    setGroups(getDeviceGroups());
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 px-4 py-10">
      <div className="flex items-start justify-between gap-3">
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <GradientBlob className="-left-12 -top-16 h-48 w-48" />
          <div className="relative">
            <h1 className="text-2xl font-semibold text-rt-ink-strong">Split a trip with friends</h1>
            <p className="mt-2 text-sm text-rt-ink-muted">
              No accounts. Share the link with the group when you&apos;re done.
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {groups.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-rt-ink-muted">Your trips</span>
          {groups.map((g) => (
            <Link
              key={g.secret}
              href={`/tools/running-tab/${g.secret}`}
              className="min-h-11 rounded-lg border border-rt-border bg-rt-surface px-3 py-2.5 text-sm text-rt-ink-strong hover:border-rt-ink-strong"
            >
              {g.name}
            </Link>
          ))}
        </div>
      )}

      <CreateGroupForm />
    </main>
  );
}
