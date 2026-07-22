"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { X, Mail, Check, PhoneCall, ShieldCheck, AlertCircle } from "lucide-react";
import { submitLead } from "@/lib/leads";
import { PhoneNumberField } from "./PhoneNumberField";

const REAPPEAR_DELAY_MS = 20_000;
const MESSAGE_MAX_LENGTH = 2000;

type Status = "idle" | "submitting" | "success" | "error";

const FIELD_CLASSES =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink-950 shadow-sm outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const LABEL_CLASSES = "flex items-baseline justify-between text-sm font-medium text-ink-950";

/** Selector for everything that can receive keyboard focus inside the dialog. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [messageLength, setMessageLength] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Opens 20s after load, then reappears every 20s of being closed — the
  // 20s clock only runs while the popup is hidden, so it can't fire while
  // already open. Reappears for every visitor on every visit, even ones
  // who already submitted before.
  useEffect(() => {
    if (open) return;
    const timer = setTimeout(() => setOpen(true), REAPPEAR_DELAY_MS);
    return () => clearTimeout(timer);
  }, [open]);

  // While open: remember the element that had focus, move focus into the
  // dialog, lock background scroll, and listen for Escape. Everything is
  // restored on close so the page is left exactly as it was found.
  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    firstFieldRef.current?.focus({ preventScroll: true });

    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      // Compensate for the vanished scrollbar so the page doesn't shift.
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocusedRef.current?.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  }

  // Keep keyboard focus cycling inside the dialog (focus trap).
  function trapFocus(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => el.offsetParent !== null); // skip the visually hidden honeypot
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const phoneCountry = String(data.phoneCountry ?? "").trim();
    const phoneNumber = String(data.phone ?? "").trim();

    const result = await submitLead({
      name: String(data.name ?? ""),
      phone: phoneNumber ? `${phoneCountry} ${phoneNumber}` : "",
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
    form.reset();
    setMessageLength(0);
    setTimeout(() => setOpen(false), 2200);
  }

  if (!open) return null;

  const isSubmitting = status === "submitting";

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      role="presentation"
    >
      {/* Scrim */}
      <div
        aria-hidden
        className="animate-settle fixed inset-0 bg-ink-950/55 backdrop-blur-[6px] motion-reduce:animate-none"
        onClick={close}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-popup-title"
        aria-describedby="lead-popup-description"
        onKeyDown={trapFocus}
        className="animate-settle relative my-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_24px_48px_-16px_rgba(15,23,42,0.28),0_64px_128px_-48px_rgba(15,23,42,0.4)] ring-1 ring-slate-900/8 motion-reduce:animate-none"
      >
        {/* Hairline brand accent along the top edge */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-accent-600 via-accent-500 to-accent-600/40"
        />

        <button
          type="button"
          onClick={close}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600/40 active:scale-95 motion-reduce:transition-none"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        {status === "success" ? (
          /* ---------------------------- Success state ---------------------------- */
          <div className="px-7 py-12 text-center sm:px-8" role="status" aria-live="polite">
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-full bg-success-50 opacity-75 [animation-iteration-count:1] motion-reduce:animate-none"
              />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-success-50 ring-1 ring-success-600/15">
                <Check className="h-6 w-6 text-success-600" strokeWidth={2.25} />
              </span>
            </div>
            <p className="mt-5 text-lg font-semibold tracking-tight text-ink-950">
              Request received
            </p>
            <p className="mx-auto mt-2 max-w-[26ch] text-sm leading-relaxed text-slate-600">
              A deliverability engineer will call you back shortly.
            </p>
            <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-900/5">
              <PhoneCall className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              Keep your phone nearby
            </p>
          </div>
        ) : (
          /* ------------------------------ Form state ----------------------------- */
          <div className="p-7 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_-2px_rgba(0,0,0,0.15)]">
                <Mail className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <div className="pr-8">
                <h2
                  id="lead-popup-title"
                  className="text-lg font-semibold leading-snug tracking-tight text-ink-950"
                >
                  Talk to a deliverability expert
                </h2>
                <p
                  id="lead-popup-description"
                  className="mt-1.5 text-sm leading-relaxed text-slate-600"
                >
                  Share your details and we&apos;ll call you back — usually within one
                  business day.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate={false}>
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
                  autoCapitalize="words"
                  spellCheck={false}
                  disabled={isSubmitting}
                  placeholder="Ada Lovelace"
                  className={FIELD_CLASSES}
                />
              </div>

              <PhoneNumberField
                id="popup-phone"
                name="phone"
                label="Mobile number"
                required
                disabled={isSubmitting}
              />

              <div>
                <label htmlFor="popup-message" className={LABEL_CLASSES}>
                  <span>Message</span>
                  <span
                    aria-hidden
                    className={`text-xs font-normal tabular-nums transition-colors ${
                      messageLength > MESSAGE_MAX_LENGTH * 0.9
                        ? "text-amber-600"
                        : "text-slate-400"
                    } ${messageLength === 0 ? "opacity-0" : "opacity-100"}`}
                  >
                    {messageLength}/{MESSAGE_MAX_LENGTH}
                  </span>
                </label>
                <textarea
                  id="popup-message"
                  name="message"
                  required
                  rows={3}
                  maxLength={MESSAGE_MAX_LENGTH}
                  disabled={isSubmitting}
                  onChange={(e) => setMessageLength(e.currentTarget.value.length)}
                  placeholder="What are you sending, and roughly how many emails per month?"
                  className={`${FIELD_CLASSES} min-h-[84px] resize-y`}
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
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-danger-600/20 bg-danger-600/5 px-3.5 py-3"
                >
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-danger-600"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <p className="text-sm leading-relaxed text-danger-600">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-3.5 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-6 py-3 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(15,23,42,0.2)] transition-all duration-150 hover:bg-accent-700 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_12px_-2px_rgba(15,23,42,0.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/25 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transition-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin motion-reduce:animate-none"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-90"
                          d="M12 2a10 10 0 0 1 10 10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Sending request…
                    </>
                  ) : (
                    "Request a callback"
                  )}
                </button>

                <p className="flex items-center justify-center gap-1.5 text-center text-xs leading-relaxed text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                  We only use your details to reply to this request.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}