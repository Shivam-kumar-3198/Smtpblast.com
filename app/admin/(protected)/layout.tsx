"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LogOut,
  Inbox,
  Newspaper,
  DollarSign,
  Quote,
  HelpCircle,
  LayoutGrid,
  ListChecks,
  Layers,
  Settings,
} from "lucide-react";
import type { User } from "firebase/auth";
import { subscribeToAdminAuth, signOutAdmin, type AdminAuthState } from "@/lib/admin-auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Leads", icon: Inbox, exact: true },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/pricing", label: "Pricing", icon: DollarSign },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/features", label: "Features", icon: LayoutGrid },
  { href: "/admin/how-it-works", label: "How it works", icon: ListChecks },
  { href: "/admin/services", label: "Solutions", icon: Layers },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-accent-600"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = subscribeToAdminAuth(setState);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!state.loading && (!state.user || !state.isAdmin)) {
      router.replace("/admin/login");
    }
  }, [state, router]);

  if (state.loading || !state.user || !state.isAdmin) {
    return <FullPageSpinner />;
  }

  return <AdminShell user={state.user}>{children}</AdminShell>;
}

function AdminShell({ user, children }: { user: User; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOutAdmin();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image
              src="/smtpblast-logo.webp"
              alt="SMTPblast"
              width={289}
              height={43}
              priority
              className="h-6 w-auto"
            />
            <span className="border-l border-slate-200 pl-2.5 text-sm font-medium text-slate-400">
              admin
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-ink-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </div>

        <nav aria-label="Admin sections" className="mx-auto max-w-7xl overflow-x-auto px-6">
          <div className="flex gap-1 whitespace-nowrap">
            {NAV_ITEMS.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-accent-600 text-ink-950"
                      : "border-transparent text-slate-500 hover:text-ink-950"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
