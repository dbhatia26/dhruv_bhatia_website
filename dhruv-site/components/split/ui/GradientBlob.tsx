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
      className={clsx("pointer-events-none absolute rounded-full opacity-60 blur-3xl", className)}
      style={{
        background:
          "radial-gradient(circle at 30% 30%, var(--rt-gradient-1), var(--rt-gradient-2) 55%, var(--rt-gradient-3) 100%)",
      }}
    />
  );
}
