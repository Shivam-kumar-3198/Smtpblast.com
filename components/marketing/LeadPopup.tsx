"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X, Mail, Check } from "lucide-react";
import { submitLead } from "@/lib/leads";

const REAPPEAR_DELAY_MS = 20_000;
const SUBMITTED_KEY = "smtpblast_popup_submitted";

type Status = "idle" | "submitting" | "success" | "error";

const FIELD_CLASSES =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink-950 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10";

const LABEL_CLASSES = "text-sm font-medium text-ink-950";

export function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  // A visitor who already converted never sees this again, in this
  // session or a later one. Lazy initializer instead of an effect, since
  // this is a synchronous read with no external subscription to manage.
  const [submittedForGood, setSubmittedForGood] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(SUBMITTED_KEY) === "1"
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  // First appearance is immediate; every reappearance after that (once
  // the visitor closes it) waits the full 20s. A ref rather than state
  // since flipping it must not itself trigger a re-render/effect re-run.
  const hasShownOnce = useRef(false);

  // Opens immediately on first load, then reappears every 20s of being
  // closed — the 20s clock only runs while the popup is hidden, so it
  // can't fire while already open.
  useEffect(() => {
    if (submittedForGood || open) return;
    const delay = hasShownOnce.current ? REAPPEAR_DELAY_MS : 0;
    const timer = setTimeout(() => {
      hasShownOnce.current = true;
      setOpen(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [open, submittedForGood]);

  useEffect(() => {
    if (!open) return;
    firstFieldRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const result = await submitLead({
      name: String(data.name ?? ""),
      phone: String(data.phone ?? ""),
      message: String(data.message ?? ""),
      source: "popup",
      company_website: String(data.company_website ?? ""),
    });

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    setStatus("success");
    window.localStorage.setItem(SUBMITTED_KEY, "1");
    setSubmittedForGood(true);
    form.reset();
    setTimeout(() => setOpen(false), 2200);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-settle"
        onClick={close}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-popup-title"
        className="animate-settle relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_48px_100px_-40px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/8 sm:p-7"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        {status === "success" ? (
          <div className="py-4 text-center" role="status">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
              <Check className="h-5 w-5 text-success-600" strokeWidth={2} />
            </div>
            <p className="mt-4 text-base font-semibold text-ink-950">Request received</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              A deliverability engineer will call you back shortly.
            </p>
          </div>
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-600 text-white">
              <Mail className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <h2 id="lead-popup-title" className="mt-4 text-lg font-semibold tracking-tight text-ink-950">
              Talk to a deliverability expert
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Share your details and we&apos;ll get back to you shortly.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate={false}>
              <div>
                <label htmlFor="popup-name" className={LABEL_CLASSES}>
                  Name
                </label>
                <input
                  ref={firstFieldRef}
                  id="popup-name"
                  name="name"
                  type="text"
                  required
                  maxLength={120}
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  className={FIELD_CLASSES}
                />
              </div>
              <div>
                <label htmlFor="popup-phone" className={LABEL_CLASSES}>
                  Mobile number
                </label>
                <input
                  id="popup-phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={40}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+1 555 123 4567"
                  className={FIELD_CLASSES}
                />
              </div>
              <div>
                <label htmlFor="popup-message" className={LABEL_CLASSES}>
                  Message <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="popup-message"
                  name="message"
                  rows={3}
                  maxLength={2000}
                  placeholder="What are you sending, and roughly how many emails per month?"
                  className={`${FIELD_CLASSES} resize-y`}
                />
              </div>

              {/* Honeypot — hidden from people, visible to bots */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="popup-company_website">Leave this field blank</label>
                <input
                  id="popup-company_website"
                  name="company_website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-danger-600" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="flex w-full items-center justify-center rounded-lg bg-accent-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Request a callback"}
              </button>
              <p className="text-center text-xs leading-relaxed text-slate-400">
                We only use your details to reply to this request.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
