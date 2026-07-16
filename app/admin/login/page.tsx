"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock } from "lucide-react";
import { checkIsAdmin, signInAdmin, signOutAdmin } from "@/lib/admin-auth";

function firebaseAuthErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again in a few minutes.";
    default:
      return "Something went wrong. Try again.";
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    const password = String(new FormData(form).get("password") ?? "");

    try {
      const credential = await signInAdmin(email, password);
      const isAdmin = await checkIsAdmin(credential.user);

      if (!isAdmin) {
        await signOutAdmin();
        setError("This account doesn't have admin access.");
        setSubmitting(false);
        return;
      }

      router.replace("/admin");
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      setError(firebaseAuthErrorMessage(code));
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/smtpblast-logo.webp"
            alt="SMTPblast"
            width={289}
            height={43}
            priority
            className="h-8 w-auto"
          />
          <p className="mt-4 text-sm text-slate-500">Sign in to the admin panel.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
        >
          <div>
            <label htmlFor="email" className="text-sm font-medium text-ink-950">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink-950 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-ink-950">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink-950 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
            />
          </div>

          {error && (
            <p className="text-sm text-danger-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink-950 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Lock className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
