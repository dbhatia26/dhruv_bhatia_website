import clsx from "clsx";

interface GradientBlobProps {
  className?: string;
}

/**
 * The one decorative device in Running Tab: a soft, blurred golden-hour
 * color field, the way Wealthsimple sits a color blob behind plain
 * black-and-white text and big confident numbers. Everything else in the
 * UI stays quiet on purpose; this is the only place color does the work of
 * feeling fun. Never reused as a button/badge/selected-state fill.
 *
 * Positioned absolutely; the parent needs position: relative and
 * overflow: hidden.
 */
export function GradientBlob({ className }: GradientBlobProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx("pointer-events-none absolute rounded-full opacity-70 blur-3xl", className)}
      style={{
        // The gradient itself fades to transparent before the shape's own
        // edge (not just relying on blur() to soften a hard-edged circle),
        // so clipping this against any container - a small card, a corner
        // it barely pokes into - never shows a hard line where the cut
        // happened. blur() on top just smooths the internal transition.
        background:
          "radial-gradient(circle at 30% 30%, var(--rt-gradient-1), var(--rt-gradient-2) 40%, var(--rt-gradient-3) 65%, transparent 100%)",
      }}
    />
  );
}
