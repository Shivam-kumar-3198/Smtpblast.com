"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X, ArrowUpRight, Send } from "lucide-react";
import { navItems } from "@/content/nav";

/* ------------------------------------------------------------------ */
/*  SMTPblast — "Paper & Transit" navigation  (v2)                     */
/*                                                                     */
/*  Fixes in this pass:                                                */
/*  1. Alignment — true 3-column grid (logo / links / actions) with    */
/*     an explicit, self-contained container. Links are optically      */
/*     centered no matter how wide the logo or CTA is.                 */
/*  2. Spacing — one consistent rhythm: 24–48px page gutters, 4px      */
/*     gaps between links, 12px between actions.                       */
/*  3. Animation — every transition runs on transform/opacity only     */
/*     (GPU-composited). No height animation, no layout thrash.        */
/* ------------------------------------------------------------------ */

const HOVER_CLOSE_DELAY = 150;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- scroll state (rAF-throttled, no jitter) ---------- */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- click outside + escape ---------- */
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /* ---------- lock body scroll while the mobile sheet is open ---------- */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* ---------- hover intent for desktop dropdowns ---------- */
  const openMenu = useCallback((label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenDropdown(null), HOVER_CLOSE_DELAY);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return (
    <header ref={navRef} className="sticky top-0 z-50 w-full">
      {/* Surface layer. Shadow is cross-faded via opacity (composited),
          never transitioned directly — this is what keeps scroll silky. */}
      <div className="relative bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
        {/* resting hairline */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-slate-900/[0.06]"
        />
        {/* scrolled shadow, cross-faded in */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 shadow-[0_1px_0_rgba(15,23,42,0.08),0_16px_40px_-24px_rgba(15,23,42,0.22)] transition-opacity duration-500 ease-out ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* signature: the transit beam gliding along the hairline */}
        <span
          aria-hidden
          className="nav-transit pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden"
        >
          <span className="nav-transit-beam" />
        </span>

        {/* Explicit container — never relies on a global .container class,
            so gutters are guaranteed: 20px mobile → 32px tablet → 48px desktop */}
        <nav
          aria-label="Primary"
          className="relative mx-auto grid h-[4.25rem] w-full max-w-[80rem] grid-cols-[auto_1fr] items-center px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-12"
        >
          {/* ---------------- left: logo ---------------- */}
          <div className="flex items-center justify-start">
            <Link
              href="/"
              aria-label="SMTPblast home"
              className="flex items-center rounded-lg py-1 outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
            >
              <Image
                src="/smtpblast-logo.webp"
                alt="SMTPblast"
                width={289}
                height={43}
                priority
                className="h-[1.9rem] w-auto"
              />
            </Link>
          </div>

          {/* ---------------- center: links (truly centered) ---------------- */}
          <ul className="hidden items-center justify-center gap-1 lg:flex">
            {navItems.map((item) => (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={item.dropdown ? () => openMenu(item.label) : undefined}
                onMouseLeave={item.dropdown ? scheduleClose : undefined}
              >
                {item.dropdown ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={openDropdown === item.label}
                      aria-haspopup="true"
                      onClick={() =>
                        setOpenDropdown((cur) => (cur === item.label ? null : item.label))
                      }
                      className={`nav-link relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.9rem] font-medium outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-accent-500/40 ${
                        openDropdown === item.label
                          ? "text-slate-900"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        aria-hidden
                        className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ease-out ${
                          openDropdown === item.label ? "rotate-180 text-accent-500" : ""
                        }`}
                        strokeWidth={1.75}
                      />
                      <span className="nav-underline" aria-hidden />
                    </button>

                    {/* -------- dropdown panel -------- */}
                    <div
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                      className={`absolute left-1/2 top-full z-50 w-[21.5rem] -translate-x-1/2 pt-3 ${
                        openDropdown === item.label
                          ? "nav-panel-open pointer-events-auto"
                          : "nav-panel-closed pointer-events-none"
                      }`}
                    >
                      <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/[0.07] shadow-[0_24px_64px_-28px_rgba(15,23,42,0.28),0_2px_8px_rgba(15,23,42,0.04)]">
                        <span
                          aria-hidden
                          className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent"
                        />
                        <div className="p-2">
                          {item.dropdown.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setOpenDropdown(null)}
                              tabIndex={openDropdown === item.label ? 0 : -1}
                              className="group/item flex items-start justify-between gap-3 rounded-xl p-3.5 outline-none transition-colors duration-200 hover:bg-slate-50 focus-visible:bg-slate-50"
                            >
                              <span className="min-w-0">
                                <span className="block text-[0.9rem] font-semibold tracking-[-0.01em] text-slate-900">
                                  {sub.label}
                                </span>
                                <span className="mt-1 block text-[0.82rem] leading-relaxed text-slate-500">
                                  {sub.description}
                                </span>
                              </span>
                              <ArrowUpRight
                                aria-hidden
                                className="mt-1 h-4 w-4 shrink-0 -translate-x-1 translate-y-1 text-accent-500 opacity-0 transition-all duration-200 ease-out group-hover/item:translate-x-0 group-hover/item:translate-y-0 group-hover/item:opacity-100"
                                strokeWidth={1.75}
                              />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href ?? "#"}
                    className="nav-link relative block rounded-full px-4 py-2 text-[0.9rem] font-medium text-slate-500 outline-none transition-colors duration-200 ease-out hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-accent-500/40"
                  >
                    {item.label}
                    <span className="nav-underline" aria-hidden />
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* ---------------- right: actions ---------------- */}
          <div className="flex items-center justify-end gap-3">
            <div className="hidden items-center lg:flex">
              <Link
                href="/get-started"
                className="group relative inline-flex h-10 items-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-slate-900 pl-5 pr-4 text-[0.9rem] font-medium text-white outline-none transition-[box-shadow,background-color] duration-300 ease-out hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.5)] focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2"
              >
                {/* accent wash slides up on hover — pure transform */}
                <span
                  aria-hidden
                  className="absolute inset-0 translate-y-full bg-accent-600 transition-transform duration-300 ease-out group-hover:translate-y-0"
                />
                <span className="relative">Get started free</span>
                <Send
                  aria-hidden
                  className="relative h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.75}
                />
              </Link>
            </div>

            {/* mobile trigger */}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 outline-none transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-accent-500/40 lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={1.75} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* ---------------- mobile sheet ---------------- */}
      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[4.25rem] z-40 overflow-y-auto bg-white lg:hidden">
          <div className="mx-auto flex min-h-full w-full max-w-[80rem] flex-col px-5 pb-10 pt-2 sm:px-8">
            <div className="flex flex-1 flex-col">
              {navItems.map((item, i) =>
                item.dropdown ? (
                  <div
                    key={item.label}
                    className="nav-sheet-item border-b border-slate-100 py-5"
                    style={{ animationDelay: `${50 + i * 50}ms` }}
                  >
                    <div className="pb-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {item.label}
                    </div>
                    <div className="flex flex-col">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between gap-4 rounded-xl px-1 py-3"
                        >
                          <span className="min-w-0">
                            <span className="block text-[1.05rem] font-medium tracking-[-0.01em] text-slate-900">
                              {sub.label}
                            </span>
                            <span className="mt-0.5 block text-sm leading-relaxed text-slate-500">
                              {sub.description}
                            </span>
                          </span>
                          <ArrowUpRight
                            aria-hidden
                            className="h-4 w-4 shrink-0 text-slate-300"
                            strokeWidth={1.75}
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href ?? "#"}
                    onClick={() => setMobileOpen(false)}
                    className="nav-sheet-item flex items-center justify-between border-b border-slate-100 py-5 text-[1.15rem] font-medium tracking-[-0.01em] text-slate-900"
                    style={{ animationDelay: `${50 + i * 50}ms` }}
                  >
                    {item.label}
                    <ArrowUpRight aria-hidden className="h-4 w-4 text-slate-300" strokeWidth={1.75} />
                  </Link>
                )
              )}
            </div>

            <div
              className="nav-sheet-item mt-8 flex flex-col gap-3"
              style={{ animationDelay: `${50 + navItems.length * 50}ms` }}
            >
              <Link
                href="/get-started"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-900 text-[0.95rem] font-medium text-white transition-colors duration-200 hover:bg-accent-600"
              >
                Get started free
                <Send aria-hidden className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- component styles ---------------- */}
      <style>{`
        /* --- Transit beam ------------------------------------------------
           A soft light pulse crossing the bottom hairline every ~9s.
           translate3d keeps it on the compositor; no layout, no paint. */
        .nav-transit-beam {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 16%;
          will-change: transform;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(15, 23, 42, 0.14) 35%,
            var(--color-accent-500, #f7941d) 55%,
            transparent
          );
          opacity: 0.8;
          transform: translate3d(-110%, 0, 0);
          animation: nav-transit 9s cubic-bezier(0.45, 0, 0.25, 1) infinite;
        }
        @keyframes nav-transit {
          0%       { transform: translate3d(-110%, 0, 0); }
          60%, 100% { transform: translate3d(640%, 0, 0); }
        }

        /* --- Link underline ---------------------------------------------
           Draws in from the left; scaleX only, so it never reflows. */
        .nav-underline {
          position: absolute;
          left: 1rem;
          right: 1rem;
          bottom: 0.3rem;
          height: 1.5px;
          border-radius: 1px;
          background: currentColor;
          opacity: 0.3;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .nav-link:hover .nav-underline,
        .nav-link:focus-visible .nav-underline {
          transform: scaleX(1);
        }

        /* --- Dropdown ----------------------------------------------------
           Kept mounted; visibility cross-faded with transform + opacity so
           opening AND closing are both eased (conditional mounting can only
           animate one direction). */
        .nav-panel-closed {
          opacity: 0;
          visibility: hidden;
          transform: translate(-50%, -6px) scale(0.98);
          transition:
            opacity 0.18s ease-out,
            transform 0.18s ease-out,
            visibility 0s linear 0.18s;
        }
        .nav-panel-open {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, 0) scale(1);
          transition:
            opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* --- Mobile sheet items ------------------------------------------ */
        .nav-sheet-item {
          animation: nav-sheet-in 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes nav-sheet-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .nav-transit-beam { animation: none; opacity: 0; }
          .nav-sheet-item { animation: none; }
          .nav-underline,
          .nav-panel-open,
          .nav-panel-closed { transition: none; }
        }
      `}</style>
    </header>
  );
}