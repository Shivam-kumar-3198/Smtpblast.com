"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PageTransition } from "./PageTransition";
import { NavigationProgress } from "./NavigationProgress";
import { WhatsAppButton } from "@/components/marketing/WhatsAppButton";
import { LeadPopup } from "@/components/marketing/LeadPopup";

// Pages that already carry a full lead-capture form — showing the popup
// there too would just be a second form on top of the first one.
const POPUP_EXCLUDED_PATHS = ["/get-started", "/talk-to-sales"];

/**
 * Scrolls to the element matching the current #hash, retrying across a
 * few frames. Needed because cross-page hash links (e.g. clicking
 * "Pricing" from /blog to "/#pricing") land before the target page's
 * content has mounted, so the browser's own scroll-to-hash fires too
 * early and silently does nothing.
 */
function scrollToCurrentHash() {
  const hash = window.location.hash;
  if (!hash) return;

  const id = decodeURIComponent(hash.slice(1));
  let attempts = 0;

  const tryScroll = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    attempts += 1;
    if (attempts < 30) requestAnimationFrame(tryScroll);
  };

  requestAnimationFrame(tryScroll);
}

export default function ClientWrapper({
  children,
  whatsappHref,
}: {
  children: React.ReactNode;
  whatsappHref?: string | null;
}) {
  const pathname = usePathname();

  // Covers cross-page navigation to a hash (pathname changes).
  useEffect(() => {
    scrollToCurrentHash();
  }, [pathname]);

  // Covers same-page hash links (pathname stays the same, only the
  // fragment changes, so the effect above wouldn't rerun).
  useEffect(() => {
    window.addEventListener("hashchange", scrollToCurrentHash);
    return () => window.removeEventListener("hashchange", scrollToCurrentHash);
  }, []);

  const isAdminRoute = pathname.startsWith("/admin");
  const showPopup = !isAdminRoute && !POPUP_EXCLUDED_PATHS.includes(pathname);

  return (
    <>
      <NavigationProgress />
      <PageTransition>{children}</PageTransition>
      {!isAdminRoute && <WhatsAppButton href={whatsappHref} />}
      {showPopup && <LeadPopup />}
    </>
  );
}