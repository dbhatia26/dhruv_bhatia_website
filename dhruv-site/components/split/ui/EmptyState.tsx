import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-rt-border px-6 py-10 text-center">
      <p className="text-sm font-medium text-rt-ink-strong">{title}</p>
      {body && <p className="max-w-xs text-sm text-rt-ink-muted">{body}</p>}
      {action}
    </div>
  );
}
