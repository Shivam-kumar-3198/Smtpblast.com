"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * A top-of-page progress bar (GitHub/YouTube-style) that appears the
 * instant an internal link is clicked, before Next.js has finished
 * fetching/rendering the destination. App Router navigations give no
 * built-in feedback between click and paint, which — especially on
 * data-driven pages — reads as the site being frozen. This closes that
 * gap without waiting on any particular route's own loading state.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function findInternalHref(target: EventTarget | null): URL | null {
      const el = target as HTMLElement | null;
      const anchor = el?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return null;
      if (anchor.target && anchor.target !== "_self") return null;
      if (anchor.hasAttribute("download")) return null;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return null;
      }
      if (url.origin !== window.location.origin) return null;
      // Same-path navigations (in-page hash links, re-clicking the
      // current page) don't trigger a route change, so no bar for those.
      if (url.pathname === window.location.pathname) return null;
      return url;
    }

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (findInternalHref(e.target)) start();
    }

    function onPopState() {
      start();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
    // start() only touches refs, so it's stable across renders and safe
    // to omit — including it would just re-bind these listeners on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function start() {
    if (activeRef.current) return;
    activeRef.current = true;

    const bar = barRef.current;
    if (!bar) return;

    bar.style.transition = "none";
    bar.style.width = "0%";
    bar.style.opacity = "1";
    void bar.offsetWidth; // force reflow so the next transition runs
    bar.style.transition = "width 8s cubic-bezier(0.1, 0.6, 0.2, 1)";
    bar.style.width = "80%";

    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    // In case a click doesn't actually lead anywhere (blocked nav,
    // external redirect that fails, etc.), don't leave the bar stuck.
    safetyTimer.current = setTimeout(finish, 8000);
  }

  function finish() {
    if (!activeRef.current) return;
    activeRef.current = false;
    if (safetyTimer.current) clearTimeout(safetyTimer.current);

    const bar = barRef.current;
    if (!bar) return;

    bar.style.transition = "width 0.25s ease-out";
    bar.style.width = "100%";
    setTimeout(() => {
      if (!barRef.current) return;
      barRef.current.style.transition = "opacity 0.2s ease-out";
      barRef.current.style.opacity = "0";
    }, 250);
  }

  // Route committed — whatever we were waiting on has arrived.
  useEffect(() => {
    finish();
  }, [pathname]);

  return (
    <div
      ref={barRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] h-[3px] w-0 rounded-r-full bg-accent-600 opacity-0"
      style={{ boxShadow: "0 0 8px 1px var(--color-accent-500, #f7941d)" }}
    />
  );
}
