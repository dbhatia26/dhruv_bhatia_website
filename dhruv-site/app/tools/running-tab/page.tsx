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
    <main className="relative min-h-dvh overflow-hidden">
      {/*
       * The blob washes across the actual page background, not a box sized
       * to the title text: clipping it against a boundary with no visible
       * edge of its own (main's own edge, same background color behind and
       * beyond it) means there's nothing to cut it off against. A tightly
       * fit wrapper here was the earlier bug — it clipped the blob against
       * an invisible box floating in the middle of the page, which showed
       * up as a hard rectangle.
       */}
      <GradientBlob className="-left-24 -top-32 h-96 w-96" />
      <div className="relative mx-auto flex max-w-md flex-col gap-8 px-4 py-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-rt-ink-strong">Split a trip with friends</h1>
            <p className="mt-2 text-sm text-rt-ink-muted">
              No accounts. Share the link with the group when you&apos;re done.
            </p>
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
      </div>
    </main>
  );
}
