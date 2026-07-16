"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, ChevronUp, ChevronDown, X } from "lucide-react";
import { createCollectionCrud } from "@/lib/collection-crud";

interface PricingLimit {
  label: string;
  value: string;
}

interface PricingFeature {
  label: string;
  included: boolean;
}

interface PricingTierDoc {
  name: string;
  tagline: string;
  isContact: boolean;
  priceUSD: number;
  priceINR: number;
  priceEUR: number;
  priceUnit: string;
  highlighted: boolean;
  limits: PricingLimit[];
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref: string;
}

type WithId<T> = T & { id: string; order: number };

const EMPTY: PricingTierDoc = {
  name: "",
  tagline: "",
  isContact: false,
  priceUSD: 0,
  priceINR: 0,
  priceEUR: 0,
  priceUnit: "/mo",
  highlighted: false,
  limits: [],
  features: [],
  ctaLabel: "Get started",
  ctaHref: "/get-started",
};

const crud = createCollectionCrud<PricingTierDoc>("pricingTiers");

export default function AdminPricingPage() {
  const [tiers, setTiers] = useState<WithId<PricingTierDoc>[] | null>(null);
  const [editing, setEditing] = useState<WithId<PricingTierDoc> | "new" | null>(null);
  const [form, setForm] = useState<PricingTierDoc>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = crud.subscribe(
      (data) => setTiers(data as WithId<PricingTierDoc>[]),
      () => setError("Couldn't load pricing. Check your connection and try again.")
    );
    return () => unsubscribe();
  }, []);

  function openNew() {
    setForm(EMPTY);
    setEditing("new");
  }

  function openEdit(tier: WithId<PricingTierDoc>) {
    setForm(tier);
    setEditing(tier);
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      if (editing === "new") {
        await crud.create({ ...form, order: tiers?.length ?? 0 } as PricingTierDoc & { order: number });
      } else if (editing) {
        await crud.update(editing.id, form);
      }
      setEditing(null);
    } catch {
      setError("Something went wrong saving this tier. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this pricing tier? This can't be undone.")) return;
    try {
      await crud.remove(id);
    } catch {
      setError("Couldn't delete that tier. Try again.");
    }
  }

  async function handleMove(tier: WithId<PricingTierDoc>, direction: -1 | 1) {
    if (!tiers) return;
    const index = tiers.findIndex((t) => t.id === tier.id);
    const swapWith = tiers[index + direction];
    if (!swapWith) return;
    try {
      await Promise.all([
        crud.update(tier.id, { order: swapWith.order } as Partial<PricingTierDoc>),
        crud.update(swapWith.id, { order: tier.order } as Partial<PricingTierDoc>),
      ]);
    } catch {
      setError("Couldn't reorder. Try again.");
    }
  }

  function updateLimit(i: number, patch: Partial<PricingLimit>) {
    setForm((f) => ({
      ...f,
      limits: f.limits.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }));
  }

  function updateFeature(i: number, patch: Partial<PricingFeature>) {
    setForm((f) => ({
      ...f,
      features: f.features.map((ft, idx) => (idx === i ? { ...ft, ...patch } : ft)),
    }));
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h4 font-semibold tracking-tight text-ink-950">Pricing</h1>
          <p className="text-sm text-slate-500">The pricing tiers shown on the homepage.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add tier
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {tiers === null && <p className="text-sm text-slate-400">Loading…</p>}
        {tiers !== null && tiers.length === 0 && (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400 ring-1 ring-slate-900/8">
            No pricing tiers yet.
          </p>
        )}
        {tiers?.map((tier, i) => (
          <div
            key={tier.id}
            className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-900/8"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink-950">
                {tier.name}
                {tier.highlighted && (
                  <span className="ml-2 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-600">
                    Highlighted
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {tier.isContact ? "Contact us" : `$${tier.priceUSD} ${tier.priceUnit}`} ·{" "}
                {tier.tagline}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => handleMove(tier, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => handleMove(tier, 1)}
                disabled={i === tiers.length - 1}
                aria-label="Move down"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => openEdit(tier)}
                aria-label="Edit"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-950"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(tier.id)}
                aria-label="Delete"
                className="rounded-full p-1.5 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div aria-hidden className="absolute inset-0 bg-ink-950/50" onClick={() => setEditing(null)} />
          <div className="relative my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-[0_48px_100px_-40px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-950">
                {editing === "new" ? "Add tier" : "Edit tier"}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-50"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink-950">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-950">Price unit</label>
                  <input
                    type="text"
                    value={form.priceUnit}
                    onChange={(e) => setForm((f) => ({ ...f, priceUnit: e.target.value }))}
                    placeholder="/mo"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-ink-950">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-ink-950">
                <input
                  type="checkbox"
                  checked={form.isContact}
                  onChange={(e) => setForm((f) => ({ ...f, isContact: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-600/30"
                />
                Show &quot;Contact us&quot; instead of a price
              </label>

              {!form.isContact && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-950">USD</label>
                    <input
                      type="number"
                      value={form.priceUSD}
                      onChange={(e) => setForm((f) => ({ ...f, priceUSD: Number(e.target.value) }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">INR</label>
                    <input
                      type="number"
                      value={form.priceINR}
                      onChange={(e) => setForm((f) => ({ ...f, priceINR: Number(e.target.value) }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">EUR</label>
                    <input
                      type="number"
                      value={form.priceEUR}
                      onChange={(e) => setForm((f) => ({ ...f, priceEUR: Number(e.target.value) }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-ink-950">
                <input
                  type="checkbox"
                  checked={form.highlighted}
                  onChange={(e) => setForm((f) => ({ ...f, highlighted: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-600/30"
                />
                Highlight as &quot;Most popular&quot;
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink-950">CTA label</label>
                  <input
                    type="text"
                    value={form.ctaLabel}
                    onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-950">CTA link</label>
                  <input
                    type="text"
                    value={form.ctaHref}
                    onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
              </div>

              {/* ---- Limits ---- */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-950">Limits</label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, limits: [...f.limits, { label: "", value: "" }] }))
                    }
                    className="text-xs font-medium text-accent-600 hover:text-accent-700"
                  >
                    + Add
                  </button>
                </div>
                <div className="mt-1.5 space-y-1.5">
                  {form.limits.map((limit, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={limit.label}
                        onChange={(e) => updateLimit(i, { label: e.target.value })}
                        placeholder="Label"
                        className="w-1/2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/10"
                      />
                      <input
                        type="text"
                        value={limit.value}
                        onChange={(e) => updateLimit(i, { value: e.target.value })}
                        placeholder="Value"
                        className="w-1/2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, limits: f.limits.filter((_, idx) => idx !== i) }))
                        }
                        aria-label="Remove limit"
                        className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- Features ---- */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-950">Features</label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        features: [...f.features, { label: "", included: true }],
                      }))
                    }
                    className="text-xs font-medium text-accent-600 hover:text-accent-700"
                  >
                    + Add
                  </button>
                </div>
                <div className="mt-1.5 space-y-1.5">
                  {form.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={feature.included}
                        onChange={(e) => updateFeature(i, { included: e.target.checked })}
                        className="h-4 w-4 shrink-0 rounded border-slate-300 text-accent-600 focus:ring-accent-600/30"
                      />
                      <input
                        type="text"
                        value={feature.label}
                        onChange={(e) => updateFeature(i, { label: e.target.value })}
                        placeholder="Feature label"
                        className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            features: f.features.filter((_, idx) => idx !== i),
                          }))
                        }
                        aria-label="Remove feature"
                        className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-5 w-full rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
