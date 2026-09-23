"use client";

import { ReactNode, useEffect, useRef } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Bottom sheet on mobile, centered dialog from sm: up. Not portaled: portaling
 * to document.body would escape the .running-tab wrapper and lose every
 * --rt-* CSS variable. position: fixed already covers the viewport correctly
 * without one, as long as no ancestor sets a transform (none here do).
 */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    panelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border-t border-rt-border bg-rt-surface-raised p-5 outline-none sm:max-w-md sm:rounded-2xl sm:border"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-rt-border sm:hidden" aria-hidden="true" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-rt-ink-strong">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-rt-ink-muted hover:text-rt-ink-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rt-ink-strong"
              >
                &times;
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
