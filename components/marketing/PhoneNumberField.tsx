"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { COUNTRY_CODES, type CountryCode } from "@/lib/country-codes";

const SORTED_COUNTRIES = [...COUNTRY_CODES].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Country-code picker + number input, styled as one joined field.
 *
 * A custom dropdown rather than a native <select> — a native select's open
 * list is rendered by the browser itself, ignoring our width/position CSS,
 * so with ~195 countries it spills out past the popup card on every
 * browser. This version is a plain absolutely-positioned panel sized and
 * anchored by us, so it always stays inside the card.
 *
 * Two separate form values, not one combined field — callers join them
 * when building the submit payload: `${data[`${name}Country`]} ${data[name]}`.
 */
export function PhoneNumberField({
  id,
  name,
  label,
  required = false,
  disabled = false,
  defaultCountryIso2 = "IN",
  optionalHint,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  defaultCountryIso2?: string;
  optionalHint?: ReactNode;
}) {
  const defaultCountry =
    SORTED_COUNTRIES.find((c) => c.iso2 === defaultCountryIso2) ?? SORTED_COUNTRIES[0];

  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Closes on an outside click/tap or Escape — the two ways any dropdown
  // is expected to dismiss.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink-950">
        {label} {optionalHint}
      </label>
      <div ref={rootRef} className="relative mt-1.5">
        <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 focus-within:border-accent-600 focus-within:ring-4 focus-within:ring-accent-600/10">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={`Country code, currently ${country.name} ${country.dialCode}`}
            className="flex shrink-0 items-center gap-1 border-0 border-r border-slate-200 bg-transparent py-2.5 pl-3 pr-2 text-sm text-ink-950 outline-none disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <span className="tabular-nums">
              {country.iso2} {country.dialCode}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
          </button>
          <input
            id={id}
            name={name}
            type="tel"
            required={required}
            disabled={disabled}
            maxLength={20}
            autoComplete="tel-national"
            inputMode="tel"
            placeholder="555 123 4567"
            className="min-w-0 flex-1 border-0 bg-transparent py-2.5 pl-3 pr-3.5 text-sm text-ink-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
          />
        </div>
        <input type="hidden" name={`${name}Country`} value={country.dialCode} />

        {open && (
          <ul
            role="listbox"
            aria-label="Country"
            className="absolute left-0 top-[calc(100%+6px)] z-20 max-h-60 w-56 max-w-[calc(100vw-3.5rem)] overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg ring-1 ring-slate-900/5"
          >
            {SORTED_COUNTRIES.map((c) => (
              <li key={c.iso2} role="option" aria-selected={c.iso2 === country.iso2}>
                <button
                  type="button"
                  onClick={() => {
                    setCountry(c);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left transition-colors ${
                    c.iso2 === country.iso2
                      ? "bg-accent-50 text-accent-700"
                      : "text-ink-950 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="shrink-0 tabular-nums text-slate-400">{c.dialCode}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
