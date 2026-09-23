import clsx from "clsx";

const PALETTE = ["#00d4ff", "#818cf8", "#7c3aed", "#34d399", "#f59e0b", "#fb7185", "#22d3ee", "#a78bfa"];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  id: string;
  name: string;
  size?: "sm" | "md";
  className?: string;
}

/** Deterministic per-member color, since there's no photo or account to pull one from. */
export function Avatar({ id, name, size = "md", className }: AvatarProps) {
  const color = PALETTE[hashString(id) % PALETTE.length];
  const dims = size === "sm" ? "h-6 w-6 text-[10px]" : "h-9 w-9 text-xs";
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-mono font-medium",
        dims,
        className
      )}
      style={{ backgroundColor: `${color}26`, color, border: `1px solid ${color}4d` }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
