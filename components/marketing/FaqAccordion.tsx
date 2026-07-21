"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Single-open accordion over native buttons (not <details>), so the
 * answer can height-animate smoothly with framer-motion instead of the
 * instant show/hide <details> gives you for free.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const baseId = useId();

  return (
    <div className="divide-y divide-slate-100">
      {items.map((item, i) => {
        const isOpen = openId === item.id;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-trigger-${i}`;

        return (
          <div key={item.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center gap-4 px-6 py-5 text-left outline-none transition-colors duration-200 hover:bg-surface-50/80 focus-visible:bg-surface-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600"
              >
                <span
                  aria-hidden
                  className={`shrink-0 font-numeric text-xs font-semibold tracking-wide transition-colors duration-300 ${
                    isOpen ? "text-accent-600" : "text-slate-300"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`flex-1 text-sm font-medium transition-colors duration-200 sm:text-base ${
                    isOpen ? "text-ink-950" : "text-ink-950/90"
                  }`}
                >
                  {item.question}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out ${
                    isOpen ? "rotate-45 bg-accent-600 text-white" : "bg-slate-50 text-slate-400"
                  }`}
                >
                  <Plus className="h-4 w-4" strokeWidth={1.75} />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  key="content"
                  initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                  animate={shouldReduceMotion ? undefined : { height: "auto", opacity: 1 }}
                  exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden bg-surface-50/60"
                >
                  <p className="px-6 pb-5 pl-[3.25rem] text-sm leading-relaxed text-slate-600">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
