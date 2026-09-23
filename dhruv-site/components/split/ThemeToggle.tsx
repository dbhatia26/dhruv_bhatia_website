"use client";

import { useEffect, useState } from "react";

/**
 * Running Tab's own light/dark toggle, separate from the marketing site's
 * html.light mechanism: this tool defaults to light (the marketing site
 * defaults to dark), so it needs its own preference rather than sharing one
 * class/key that can't hold two different defaults at once. Scoped to the
 * .running-tab wrapper, not <html>, so it never touches the rest of the site.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("runningTab.theme") === "dark";
    setDark(saved);
    document.querySelector(".running-tab")?.classList.toggle("dark", saved);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.querySelector(".running-tab")?.classList.toggle("dark", next);
    try {
      localStorage.setItem("runningTab.theme", next ? "dark" : "light");
    } catch {
      // Nothing to do: the app still works, just re-defaults to light next visit.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rt-border bg-rt-surface text-rt-ink-muted hover:text-rt-ink-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rt-ink-strong"
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
