"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics } from "@/lib/firebase-analytics";

/**
 * Firebase Analytics only logs a page_view on SDK init, which fires once
 * per full page load. Client-side route changes in the App Router don't
 * trigger a reload, so each navigation is logged manually here instead.
 */
export function FirebaseAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    getFirebaseAnalytics().then((analytics) => {
      if (!analytics || cancelled) return;
      const query = searchParams.toString();
      logEvent(analytics, "page_view", {
        page_path: query ? `${pathname}?${query}` : pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  return null;
}
