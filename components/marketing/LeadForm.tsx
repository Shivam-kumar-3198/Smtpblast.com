"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { planOptions } from "@/lib/lead-schema";
import { submitLead } from "@/lib/leads";

const PLAN_LABELS: Record<(typeof planOptions)[number], string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
  enterprise: "Enterprise",
  cluster: "Cluster",
  custom: "Custom",
  "not-sure": "Not sure yet",
};

type Status = "idle" | "submitting" | "success" | "error";

const FIELD_CLASSES =
  "mt-1.5 w-full rounded-lg border border-[#DCE3DE] bg-white px-3.5 py-2.5 text-sm text-[#101512] shadow-sm outline-none transition placeholder:text-[#A5B0A9] hover:border-[#B9C6BE] focus:border-[#14372F] focus:ring-4 focus:ring-[#14372F]/10";

const LABEL_CLASSES = "text-sm font-medium text-[#101512]";

const MESSAGE_MAX = 2000;

export function LeadForm({
  source,
  defaultPlan,
}: {
  source: string;
  defaultPlan?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [messageLength, setMessageLength] = useState(0);

  const initialPlan = planOptions.includes(
    defaultPlan as (typeof planOptions)[number]
  )
    ? (defaultPlan as (typeof planOptions)[number])
    : undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const result = await submitLead({
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      phone: String(data.phone ?? ""),
      company: String(data.company ?? ""),
      planInterest: (data.planInterest || undefined) as
        | (typeof planOptions)[number]
        | undefined,
      message: String(data.message ?? ""),
      source,
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
    router.push(`/thank-you?source=${encodeURIComponent(source)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={LABEL_CLASSES}>
            Name
          </label>
          <input
            id="name"
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
          <label htmlFor="email" className={LABEL_CLASSES}>
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            inputMode="email"
            placeholder="ada@company.com"
            className={FIELD_CLASSES}
          />
        </div>
        <div>
          <label htmlFor="phone" className={LABEL_CLASSES}>
            Phone{" "}
            <span className="font-normal text-[#8A968F]">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={40}
            autoComplete="tel"
            inputMode="tel"
            className={FIELD_CLASSES}
          />
        </div>
        <div>
          <label htmlFor="company" className={LABEL_CLASSES}>
            Company{" "}
            <span className="font-normal text-[#8A968F]">(optional)</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            maxLength={160}
            autoComplete="organization"
            className={FIELD_CLASSES}
          />
        </div>
      </div>

      {/* Plan interest as tactile pills instead of a dropdown */}
      <fieldset>
        <legend className={LABEL_CLASSES}>
          Sending volume / plan interest
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {planOptions.map((plan) => (
            <label key={plan} className="cursor-pointer">
              <input
                type="radio"
                name="planInterest"
                value={plan}
                defaultChecked={initialPlan === plan}
                className="peer sr-only"
              />
              <span className="inline-flex items-center rounded-full border border-[#DCE3DE] bg-white px-3.5 py-1.5 text-sm text-[#3E4A43] shadow-sm transition hover:border-[#B9C6BE] peer-checked:border-[#14372F] peer-checked:bg-[#14372F] peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-[#14372F]/15">
                {PLAN_LABELS[plan]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="message" className={LABEL_CLASSES}>
            Message{" "}
            <span className="font-normal text-[#8A968F]">(optional)</span>
          </label>
          {messageLength > 0 && (
            <span className="text-xs tabular-nums text-[#8A968F]">
              {messageLength}/{MESSAGE_MAX}
            </span>
          )}
        </div>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={MESSAGE_MAX}
          placeholder="What are you sending, and roughly how many emails per month?"
          onChange={(e) => setMessageLength(e.target.value.length)}
          className={`${FIELD_CLASSES} resize-y`}
        />
      </div>

      {/* Honeypot — hidden from people, visible to bots */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company_website">Leave this field blank</label>
        <input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status === "error" && (
        <div
          className="flex items-start gap-2.5 rounded-lg border border-[#F1C4C0] bg-[#FDF3F2] px-3.5 py-3"
          role="alert"
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-[#B3423A]"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-12a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0V6zm.75 8.5a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm leading-relaxed text-[#8C2F29]">
            {errorMessage}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#14372F] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#0C231E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14372F]/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? (
          <>
            <svg
              className="h-4 w-4 animate-spin motion-reduce:hidden"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                d="M22 12a10 10 0 00-10-10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            Sending…
          </>
        ) : (
          <>
            Request my setup plan
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 10h12m0 0l-4.5-4.5M16 10l-4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}