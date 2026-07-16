"use client";

import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { Plus, X } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  getSiteSettingsDoc,
  EMPTY_SITE_SETTINGS_DOC,
  type SiteSettingsDoc,
} from "@/lib/site-settings-content";

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SiteSettingsDoc>(EMPTY_SITE_SETTINGS_DOC);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteSettingsDoc()
      .then(setForm)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await setDoc(doc(db, "siteSettings", "main"), form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Something went wrong saving settings. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-h4 font-semibold tracking-tight text-ink-950">Site settings</h1>
      <p className="text-sm text-slate-500">
        Contact details, social links, and the homepage trust stat.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-4 rounded-lg border border-success-500/20 bg-success-50 px-4 py-3 text-sm text-success-600">
          Saved.
        </p>
      )}

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-900/8">
          <h2 className="text-sm font-semibold text-ink-950">Company</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink-950">Company name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-950">Legal name</label>
              <input
                type="text"
                value={form.legalName}
                onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
              />
            </div>
          </div>
        </div>

        {/* Phone / WhatsApp / Email */}
        {(
          [
            { key: "Phone" as const, has: "hasPhone" as const, display: "phoneDisplay" as const, href: "phoneHref" as const, source: "phoneSource" as const, hrefPlaceholder: "tel:+91..." },
            { key: "WhatsApp" as const, has: "hasWhatsapp" as const, display: "whatsappDisplay" as const, href: "whatsappHref" as const, source: "whatsappSource" as const, hrefPlaceholder: "https://api.whatsapp.com/send?..." },
            { key: "Email" as const, has: "hasEmail" as const, display: "emailDisplay" as const, href: "emailHref" as const, source: "emailSource" as const, hrefPlaceholder: "mailto:..." },
          ]
        ).map((channel) => (
          <div key={channel.key} className="rounded-2xl bg-white p-5 ring-1 ring-slate-900/8">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-950">
              <input
                type="checkbox"
                checked={form[channel.has]}
                onChange={(e) => setForm((f) => ({ ...f, [channel.has]: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-600/30"
              />
              {channel.key}
            </label>
            {form[channel.has] && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink-950">Display text</label>
                  <input
                    type="text"
                    value={form[channel.display]}
                    onChange={(e) => setForm((f) => ({ ...f, [channel.display]: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-950">Link</label>
                  <input
                    type="text"
                    value={form[channel.href]}
                    onChange={(e) => setForm((f) => ({ ...f, [channel.href]: e.target.value }))}
                    placeholder={channel.hrefPlaceholder}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-ink-950">
                    Source <span className="font-normal text-slate-400">(where this was verified)</span>
                  </label>
                  <input
                    type="text"
                    value={form[channel.source]}
                    onChange={(e) => setForm((f) => ({ ...f, [channel.source]: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Social links */}
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-900/8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-950">Social links</h2>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, social: [...f.social, { platform: "", href: "" }] }))
              }
              className="inline-flex items-center gap-1 text-xs font-medium text-accent-600 hover:text-accent-700"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add
            </button>
          </div>
          <div className="mt-3 space-y-1.5">
            {form.social.map((link, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={link.platform}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      social: f.social.map((s, idx) =>
                        idx === i ? { ...s, platform: e.target.value } : s
                      ),
                    }))
                  }
                  placeholder="Platform (e.g. Instagram)"
                  className="w-1/3 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-accent-600"
                />
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      social: f.social.map((s, idx) =>
                        idx === i ? { ...s, href: e.target.value } : s
                      ),
                    }))
                  }
                  placeholder="https://..."
                  className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-accent-600"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, social: f.social.filter((_, idx) => idx !== i) }))
                  }
                  aria-label="Remove"
                  className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trust stat */}
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-900/8">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-950">
            <input
              type="checkbox"
              checked={form.hasTrustStat}
              onChange={(e) => setForm((f) => ({ ...f, hasTrustStat: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-600/30"
            />
            Homepage trust stat
          </label>
          {form.hasTrustStat && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-ink-950">Statement</label>
                <input
                  type="text"
                  value={form.trustStatValue}
                  onChange={(e) => setForm((f) => ({ ...f, trustStatValue: e.target.value }))}
                  placeholder="e.g. 8 years delivering email infrastructure across 45 countries"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-950">
                  Source <span className="font-normal text-slate-400">(no unverifiable claims)</span>
                </label>
                <input
                  type="text"
                  value={form.trustStatSource}
                  onChange={(e) => setForm((f) => ({ ...f, trustStatSource: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-accent-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
