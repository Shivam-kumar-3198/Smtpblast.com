"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/blog-content";

/**
 * Desktop TOC. The <nav> and its anchor links are plain, server-rendered
 * HTML (SSR-safe, crawlable, works with JS disabled) — this component only
 * layers an active-section highlight on top by watching each heading with
 * IntersectionObserver, so removing/disabling JS degrades to a perfectly
 * normal list of jump links rather than an empty page. Stickiness is
 * applied by the parent (app/blog/[slug]/page.tsx), which stacks this
 * alongside the brand card in one shared sticky container.
 */
export function TableOfContentsSidebar({ toc }: { toc: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = toc
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b
        );
        setActiveId(topmost.target.id);
      },
      // A thin activation band near the top of the viewport — a heading
      // counts as "current" once it crosses just below the sticky nav.
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  return (
    <nav
      aria-label="Table of contents"
      className="animate-settle rounded-2xl bg-surface-50 p-5 ring-1 ring-slate-900/6"
    >
      <p className="text-small font-semibold uppercase tracking-[0.14em] text-slate-400">In this article</p>
      <ul className="mt-3 space-y-1">
        {toc.map((entry) => {
          const isActive = entry.id === activeId;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`block rounded-md border-l-2 py-1.5 text-sm leading-snug transition-colors duration-150 ${
                  entry.level === 3 ? "pl-6" : "pl-3"
                } ${
                  isActive
                    ? "border-accent-600 bg-white font-medium text-accent-600 shadow-[0_1px_4px_rgba(15,23,42,0.06)]"
                    : "border-transparent text-slate-600 hover:text-ink-950"
                }`}
              >
                {entry.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
