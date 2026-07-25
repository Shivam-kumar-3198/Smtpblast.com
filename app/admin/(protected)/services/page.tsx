"use client";

import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronUp,
  ChevronDown,
  X,
  ImagePlus,
  Link2,
  ExternalLink,
  Globe,
} from "lucide-react";
import { createCollectionCrud } from "@/lib/collection-crud";
import { db } from "@/lib/firebase";
import {
  getSolutionsSettingsDoc,
  DEFAULT_SOLUTIONS_SETTINGS,
  type SolutionsSettingsDoc,
} from "@/lib/solutions-content";

interface ServiceIncludedItem {
  icon: string;
  title: string;
  description: string;
}

interface ServiceFlowNode {
  icon: string;
  label: string;
  sublabel: string;
}

interface ServiceLink {
  text: string;
  url: string;
  nofollow: boolean;
}

interface ServiceFaqItem {
  question: string;
  answer: string;
}

interface ServiceDoc {
  slug: string;
  name: string;
  icon: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  heading: string;
  description: string;
  useCase: string;
  included: ServiceIncludedItem[];
  flow: ServiceFlowNode[];
  primaryImage: string;
  primaryImageAlt: string;
  secondaryImage: string;
  secondaryImageAlt: string;
  heroBadgeIcon: string;
  heroBadgeLabel: string;
  links: ServiceLink[];
  faq: ServiceFaqItem[];
}

/** Internal vs external is inferred from the URL, same rule the blog editor uses. */
function isInternalUrl(url: string): boolean {
  return url.startsWith("/") || url.startsWith("#") || /smtpblast\.com/i.test(url);
}

type WithId<T> = T & { id: string; order: number };

const EMPTY: ServiceDoc = {
  slug: "",
  name: "",
  icon: "Server",
  summary: "",
  metaTitle: "",
  metaDescription: "",
  heading: "",
  description: "",
  useCase: "",
  included: [],
  flow: [],
  primaryImage: "",
  primaryImageAlt: "",
  secondaryImage: "",
  secondaryImageAlt: "",
  heroBadgeIcon: "Rocket",
  heroBadgeLabel: "",
  links: [],
  faq: [],
};

const crud = createCollectionCrud<ServiceDoc>("services");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<WithId<ServiceDoc>[] | null>(null);
  const [editing, setEditing] = useState<WithId<ServiceDoc> | "new" | null>(null);
  const [form, setForm] = useState<ServiceDoc>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageUrlInputs, setImageUrlInputs] = useState<{ primary: string; secondary: string }>({
    primary: "",
    secondary: "",
  });

  // Section-level copy (headings, intros, CTAs) that wraps around the
  // per-service list above — a separate singleton doc (solutionsSettings/
  // main), same pattern as Site Settings, so it never touches the
  // `services` collection or its documents.
  const [sectionForm, setSectionForm] = useState<SolutionsSettingsDoc>(DEFAULT_SOLUTIONS_SETTINGS);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionSaved, setSectionSaved] = useState(false);
  const [sectionError, setSectionError] = useState("");

  useEffect(() => {
    const unsubscribe = crud.subscribe(
      (data) => setServices(data as WithId<ServiceDoc>[]),
      () => setError("Couldn't load services. Check your connection and try again.")
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getSolutionsSettingsDoc()
      .then(setSectionForm)
      .finally(() => setSectionLoading(false));
  }, []);

  async function handleSectionSave() {
    setSectionSaving(true);
    setSectionError("");
    setSectionSaved(false);
    try {
      await setDoc(doc(db, "solutionsSettings", "main"), sectionForm);
      setSectionSaved(true);
      setTimeout(() => setSectionSaved(false), 2500);
    } catch (err) {
      setSectionError(
        err instanceof Error
          ? `Couldn't save: ${err.message}`
          : "Something went wrong saving this content. Try again."
      );
    } finally {
      setSectionSaving(false);
    }
  }

  function openNew() {
    setForm(EMPTY);
    setImageUrlInputs({ primary: "", secondary: "" });
    setEditing("new");
  }

  function openEdit(service: WithId<ServiceDoc>) {
    setForm({ ...EMPTY, ...service, links: service.links ?? [], faq: service.faq ?? [] });
    setImageUrlInputs({ primary: "", secondary: "" });
    setEditing(service);
  }

  function handleImageLink(slot: "primary" | "secondary") {
    const url = imageUrlInputs[slot].trim();
    if (!url) return;
    setForm((f) =>
      slot === "primary" ? { ...f, primaryImage: url } : { ...f, secondaryImage: url }
    );
  }

  function clearImage(slot: "primary" | "secondary") {
    setImageUrlInputs((s) => ({ ...s, [slot]: "" }));
    setForm((f) =>
      slot === "primary" ? { ...f, primaryImage: "" } : { ...f, secondaryImage: "" }
    );
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    setSaving(true);
    try {
      await Promise.all([
        editing === "new"
          ? crud.create({ ...form, order: services?.length ?? 0 } as ServiceDoc & { order: number })
          : editing
            ? crud.update(editing.id, form)
            : Promise.resolve(),
        // The "shared across all services" fields edited from this same
        // modal live on their own singleton doc, not on this service —
        // saved alongside it here so the whole modal feels like one save
        // action instead of two.
        setDoc(doc(db, "solutionsSettings", "main"), sectionForm),
      ]);
      setEditing(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Couldn't save: ${err.message}`
          : "Something went wrong saving this service. Try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this service page? This can't be undone.")) return;
    try {
      await crud.remove(id);
    } catch {
      setError("Couldn't delete that service. Try again.");
    }
  }

  async function handleMove(service: WithId<ServiceDoc>, direction: -1 | 1) {
    if (!services) return;
    const index = services.findIndex((s) => s.id === service.id);
    const swapWith = services[index + direction];
    if (!swapWith) return;
    try {
      await Promise.all([
        crud.update(service.id, { order: swapWith.order } as Partial<ServiceDoc>),
        crud.update(swapWith.id, { order: service.order } as Partial<ServiceDoc>),
      ]);
    } catch {
      setError("Couldn't reorder. Try again.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h4 font-semibold tracking-tight text-ink-950">Solutions / Services</h1>
          <p className="text-sm text-slate-500">The /services/[slug] detail pages.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add service
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          {error}
        </p>
      )}

      {/* ================= Homepage overview block ================= */}
      <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-900/8">
        <h2 className="text-sm font-semibold text-ink-950">Homepage overview block</h2>
        <p className="mt-1 text-xs text-slate-500">
          The &quot;What we offer&quot; section on the homepage — its eyebrow, heading, card
          CTA label, and the &quot;Need something tailored?&quot; callout card. Each
          individual service&apos;s own content is edited via that service&apos;s own card
          below.
        </p>

        {sectionLoading ? (
          <p className="mt-4 text-sm text-slate-400">Loading…</p>
        ) : (
          <>
            {sectionError && (
              <p className="mt-4 rounded-lg border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600">
                {sectionError}
              </p>
            )}
            {sectionSaved && (
              <p className="mt-4 rounded-lg border border-success-500/20 bg-success-50 px-4 py-3 text-sm text-success-600">
                Saved.
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-ink-950">Eyebrow</label>
                <input
                  type="text"
                  value={sectionForm.overviewEyebrow}
                  onChange={(e) => setSectionForm((f) => ({ ...f, overviewEyebrow: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-950">Card CTA label</label>
                <input
                  type="text"
                  value={sectionForm.overviewCardCtaLabel}
                  onChange={(e) =>
                    setSectionForm((f) => ({ ...f, overviewCardCtaLabel: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-ink-950">Heading</label>
              <input
                type="text"
                value={sectionForm.overviewHeading}
                onChange={(e) => setSectionForm((f) => ({ ...f, overviewHeading: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
              />
            </div>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              &quot;Need something tailored?&quot; callout card
            </p>
            <div className="mt-2">
              <label className="text-xs font-medium text-ink-950">Callout heading</label>
              <input
                type="text"
                value={sectionForm.overviewCalloutHeading}
                onChange={(e) =>
                  setSectionForm((f) => ({ ...f, overviewCalloutHeading: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
              />
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-ink-950">Callout body</label>
              <textarea
                rows={2}
                value={sectionForm.overviewCalloutBody}
                onChange={(e) =>
                  setSectionForm((f) => ({ ...f, overviewCalloutBody: e.target.value }))
                }
                className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-ink-950">Callout CTA label</label>
                <input
                  type="text"
                  value={sectionForm.overviewCalloutCtaLabel}
                  onChange={(e) =>
                    setSectionForm((f) => ({ ...f, overviewCalloutCtaLabel: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-950">Callout CTA link</label>
                <input
                  type="text"
                  value={sectionForm.overviewCalloutCtaHref}
                  onChange={(e) =>
                    setSectionForm((f) => ({ ...f, overviewCalloutCtaHref: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSectionSave}
              disabled={sectionSaving}
              className="mt-4 w-full rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {sectionSaving ? "Saving…" : "Save homepage overview"}
            </button>
          </>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {services === null && <p className="text-sm text-slate-400">Loading…</p>}
        {services !== null && services.length === 0 && (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400 ring-1 ring-slate-900/8">
            No services yet.
          </p>
        )}
        {services?.map((service, i) => (
          <div
            key={service.id}
            className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-900/8"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink-950">{service.name}</p>
              <p className="mt-1 text-xs text-slate-500">/services/{service.slug}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => handleMove(service, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => handleMove(service, 1)}
                disabled={i === services.length - 1}
                aria-label="Move down"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => openEdit(service)}
                aria-label="Edit"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-950"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(service.id)}
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
          <div className="relative my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-[0_48px_100px_-40px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-950">
                {editing === "new" ? "Add service" : "Edit service"}
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
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        name: e.target.value,
                        slug: editing === "new" ? slugify(e.target.value) : f.slug,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-950">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-ink-950">Summary (card blurb)</label>
                <textarea
                  rows={2}
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-950">Hero heading</label>
                <input
                  type="text"
                  value={form.heading}
                  onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-950">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-950">
                  Use case (&quot;Best for...&quot; line)
                </label>
                <input
                  type="text"
                  value={form.useCase}
                  onChange={(e) => setForm((f) => ({ ...f, useCase: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>

              {/* ---- Shared: breadcrumb + hero buttons ---- */}
              <div className="rounded-lg border border-dashed border-accent-300 bg-accent-50/40 p-3">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                    Shared across all services — breadcrumb &amp; hero buttons
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Editing this here updates it on every service page, not just this one.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-950">Breadcrumb label</label>
                    <input
                      type="text"
                      value={sectionForm.breadcrumbLabel}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, breadcrumbLabel: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">Breadcrumb link</label>
                    <input
                      type="text"
                      value={sectionForm.breadcrumbHref}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, breadcrumbHref: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">Primary button label</label>
                    <input
                      type="text"
                      value={sectionForm.heroCtaPrimaryLabel}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, heroCtaPrimaryLabel: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">Primary button link</label>
                    <input
                      type="text"
                      value={sectionForm.heroCtaPrimaryHref}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, heroCtaPrimaryHref: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">
                      Secondary button label
                    </label>
                    <input
                      type="text"
                      value={sectionForm.heroCtaSecondaryLabel}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, heroCtaSecondaryLabel: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">
                      Secondary button link
                    </label>
                    <input
                      type="text"
                      value={sectionForm.heroCtaSecondaryHref}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, heroCtaSecondaryHref: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink-950">Meta title</label>
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-950">
                    Icon (lucide-react name)
                  </label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-ink-950">Meta description</label>
                <textarea
                  rows={2}
                  value={form.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                  className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                />
              </div>

              {/* ---- Hero images ---- */}
              <div className="grid grid-cols-2 gap-3">
                {(["primary", "secondary"] as const).map((slot) => (
                  <div key={slot}>
                    <label className="text-xs font-medium capitalize text-ink-950">
                      {slot} image
                    </label>
                    {form[`${slot}Image`] ? (
                      <div className="relative mt-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form[`${slot}Image`]}
                          alt=""
                          className="aspect-square w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => clearImage(slot)}
                          aria-label="Change image"
                          className="absolute right-1.5 top-1.5 rounded-full bg-ink-950/60 p-1 text-white hover:bg-ink-950/80"
                        >
                          <X className="h-3 w-3" strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 p-2 text-slate-400">
                        <ImagePlus className="h-5 w-5" strokeWidth={1.5} />
                        <input
                          type="text"
                          value={imageUrlInputs[slot]}
                          onChange={(e) =>
                            setImageUrlInputs((s) => ({ ...s, [slot]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleImageLink(slot);
                            }
                          }}
                          placeholder="ImageKit link"
                          className="w-full rounded border border-slate-200 px-1.5 py-1 text-[11px] text-ink-950 outline-none focus:border-accent-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageLink(slot)}
                          disabled={!imageUrlInputs[slot].trim()}
                          className="w-full rounded bg-accent-600 px-1.5 py-1 text-[11px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Use link
                        </button>
                      </div>
                    )}
                    <input
                      type="text"
                      value={form[`${slot}ImageAlt`]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [`${slot}ImageAlt`]: e.target.value }))
                      }
                      placeholder="Alt text"
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/10"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink-950">
                    Hero badge icon (lucide name)
                  </label>
                  <input
                    type="text"
                    value={form.heroBadgeIcon}
                    onChange={(e) => setForm((f) => ({ ...f, heroBadgeIcon: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-950">Hero badge label</label>
                  <input
                    type="text"
                    value={form.heroBadgeLabel}
                    onChange={(e) => setForm((f) => ({ ...f, heroBadgeLabel: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
              </div>

              {/* ---- Shared: "What's included" section heading ---- */}
              <div className="rounded-lg border border-dashed border-accent-300 bg-accent-50/40 p-3">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                    Shared across all services — &quot;What&apos;s included&quot; heading
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Editing this here updates it on every service page, not just this one.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-950">Eyebrow</label>
                    <input
                      type="text"
                      value={sectionForm.includedEyebrow}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, includedEyebrow: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">
                      Heading (use <code className="rounded bg-slate-100 px-1">{"{name}"}</code>{" "}
                      for the service name)
                    </label>
                    <input
                      type="text"
                      value={sectionForm.includedHeadingTemplate}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, includedHeadingTemplate: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                </div>
              </div>

              {/* ---- Included cards ---- */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-950">
                    &quot;What&apos;s included&quot; cards
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        included: [...f.included, { icon: "ShieldCheck", title: "", description: "" }],
                      }))
                    }
                    className="text-xs font-medium text-accent-600 hover:text-accent-700"
                  >
                    + Add
                  </button>
                </div>
                <div className="mt-1.5 space-y-2">
                  {form.included.map((item, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-2.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={item.icon}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              included: f.included.map((it, idx) =>
                                idx === i ? { ...it, icon: e.target.value } : it
                              ),
                            }))
                          }
                          placeholder="Icon"
                          className="w-20 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                        />
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              included: f.included.map((it, idx) =>
                                idx === i ? { ...it, title: e.target.value } : it
                              ),
                            }))
                          }
                          placeholder="Title"
                          className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              included: f.included.filter((_, idx) => idx !== i),
                            }))
                          }
                          aria-label="Remove"
                          className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            included: f.included.map((it, idx) =>
                              idx === i ? { ...it, description: e.target.value } : it
                            ),
                          }))
                        }
                        placeholder="Description"
                        className="mt-1.5 w-full resize-y rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- Flow diagram ---- */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-950">Flow diagram nodes</label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        flow: [...f.flow, { icon: "Server", label: "", sublabel: "" }],
                      }))
                    }
                    className="text-xs font-medium text-accent-600 hover:text-accent-700"
                  >
                    + Add
                  </button>
                </div>
                <div className="mt-1.5 space-y-1.5">
                  {form.flow.map((node, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={node.icon}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            flow: f.flow.map((n, idx) =>
                              idx === i ? { ...n, icon: e.target.value } : n
                            ),
                          }))
                        }
                        placeholder="Icon"
                        className="w-20 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                      />
                      <input
                        type="text"
                        value={node.label}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            flow: f.flow.map((n, idx) =>
                              idx === i ? { ...n, label: e.target.value } : n
                            ),
                          }))
                        }
                        placeholder="Label"
                        className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                      />
                      <input
                        type="text"
                        value={node.sublabel}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            flow: f.flow.map((n, idx) =>
                              idx === i ? { ...n, sublabel: e.target.value } : n
                            ),
                          }))
                        }
                        placeholder="Sublabel"
                        className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, flow: f.flow.filter((_, idx) => idx !== i) }))
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

              {/* ---- Shared: "Shared vs. dedicated" heading ---- */}
              <div className="rounded-lg border border-dashed border-accent-300 bg-accent-50/40 p-3">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                    Shared across all services — &quot;Shared vs. dedicated&quot; heading
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Editing this here updates it on every service page, not just this one.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-950">Eyebrow</label>
                    <input
                      type="text"
                      value={sectionForm.sharedVsDedicatedEyebrow}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, sharedVsDedicatedEyebrow: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">Heading</label>
                    <input
                      type="text"
                      value={sectionForm.sharedVsDedicatedHeading}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, sharedVsDedicatedHeading: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                </div>
              </div>

              {/* ---- Shared: "Shared vs. dedicated" comparison table ---- */}
              <div className="rounded-lg border border-dashed border-accent-300 bg-accent-50/40 p-3">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                    Shared across all services — comparison table
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Editing this here updates it on every service page and the homepage&apos;s
                  shared-vs-dedicated comparison section.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-950">
                      &quot;Shared&quot; column label
                    </label>
                    <input
                      type="text"
                      value={sectionForm.sharedVsDedicatedSharedColumnLabel}
                      onChange={(e) =>
                        setSectionForm((f) => ({
                          ...f,
                          sharedVsDedicatedSharedColumnLabel: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">
                      &quot;Dedicated&quot; column label
                    </label>
                    <input
                      type="text"
                      value={sectionForm.sharedVsDedicatedDedicatedColumnLabel}
                      onChange={(e) =>
                        setSectionForm((f) => ({
                          ...f,
                          sharedVsDedicatedDedicatedColumnLabel: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-950">Comparison rows</label>
                  <button
                    type="button"
                    onClick={() =>
                      setSectionForm((f) => ({
                        ...f,
                        sharedVsDedicatedRows: [
                          ...f.sharedVsDedicatedRows,
                          { label: "", shared: "", dedicated: "" },
                        ],
                      }))
                    }
                    className="text-xs font-medium text-accent-600 hover:text-accent-700"
                  >
                    + Add
                  </button>
                </div>
                <div className="mt-1.5 space-y-2">
                  {sectionForm.sharedVsDedicatedRows.map((row, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-white p-2.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={row.label}
                          onChange={(e) =>
                            setSectionForm((f) => ({
                              ...f,
                              sharedVsDedicatedRows: f.sharedVsDedicatedRows.map((r, idx) =>
                                idx === i ? { ...r, label: e.target.value } : r
                              ),
                            }))
                          }
                          placeholder="Row label (e.g. Reputation)"
                          className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSectionForm((f) => ({
                              ...f,
                              sharedVsDedicatedRows: f.sharedVsDedicatedRows.filter(
                                (_, idx) => idx !== i
                              ),
                            }))
                          }
                          aria-label="Remove"
                          className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={row.shared}
                        onChange={(e) =>
                          setSectionForm((f) => ({
                            ...f,
                            sharedVsDedicatedRows: f.sharedVsDedicatedRows.map((r, idx) =>
                              idx === i ? { ...r, shared: e.target.value } : r
                            ),
                          }))
                        }
                        placeholder="Shared IP column text"
                        className="mt-1.5 w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                      />
                      <input
                        type="text"
                        value={row.dedicated}
                        onChange={(e) =>
                          setSectionForm((f) => ({
                            ...f,
                            sharedVsDedicatedRows: f.sharedVsDedicatedRows.map((r, idx) =>
                              idx === i ? { ...r, dedicated: e.target.value } : r
                            ),
                          }))
                        }
                        placeholder="Dedicated IP column text"
                        className="mt-1.5 w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-ink-950">Footnote</label>
                  <input
                    type="text"
                    value={sectionForm.sharedVsDedicatedFootnote}
                    onChange={(e) =>
                      setSectionForm((f) => ({ ...f, sharedVsDedicatedFootnote: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
              </div>

              {/* ---- Shared: "How it works" section heading ---- */}
              <div className="rounded-lg border border-dashed border-accent-300 bg-accent-50/40 p-3">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                    Shared across all services — &quot;How it works&quot; heading
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Editing this here updates it on every service page, not just this one. The
                  numbered steps themselves are managed on the How It Works admin page.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-950">Eyebrow</label>
                    <input
                      type="text"
                      value={sectionForm.howItWorksEyebrow}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, howItWorksEyebrow: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">Heading</label>
                    <input
                      type="text"
                      value={sectionForm.howItWorksHeading}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, howItWorksHeading: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                </div>
              </div>

              {/* ---- Shared: "Testimonials" section heading ---- */}
              <div className="rounded-lg border border-dashed border-accent-300 bg-accent-50/40 p-3">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                    Shared across all services — testimonials heading
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Editing this here updates it on every service page, not just this one. The
                  testimonials themselves are managed on the Testimonials admin page.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-950">Eyebrow</label>
                    <input
                      type="text"
                      value={sectionForm.testimonialsEyebrow}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, testimonialsEyebrow: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">
                      Heading (use <code className="rounded bg-slate-100 px-1">{"{name}"}</code>{" "}
                      for the service name)
                    </label>
                    <input
                      type="text"
                      value={sectionForm.testimonialsHeadingTemplate}
                      onChange={(e) =>
                        setSectionForm((f) => ({
                          ...f,
                          testimonialsHeadingTemplate: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                </div>
              </div>

              {/* ---- Shared: "Related links" section heading ---- */}
              <div className="rounded-lg border border-dashed border-accent-300 bg-accent-50/40 p-3">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                    Shared across all services — &quot;Related links&quot; heading
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Editing this here updates it on every service page, not just this one. The
                  links themselves are set per-service below.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-950">Eyebrow</label>
                    <input
                      type="text"
                      value={sectionForm.relatedLinksEyebrow}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, relatedLinksEyebrow: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">
                      Heading (use <code className="rounded bg-slate-100 px-1">{"{name}"}</code>{" "}
                      for the service name)
                    </label>
                    <input
                      type="text"
                      value={sectionForm.relatedLinksHeadingTemplate}
                      onChange={(e) =>
                        setSectionForm((f) => ({
                          ...f,
                          relatedLinksHeadingTemplate: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                </div>
              </div>

              {/* ---- SEO: links ---- */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-950">
                    SEO links (internal &amp; external)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        links: [...f.links, { text: "", url: "", nofollow: false }],
                      }))
                    }
                    className="text-xs font-medium text-accent-600 hover:text-accent-700"
                  >
                    + Add
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Internal vs. external is detected automatically from the URL. Toggle
                  Nofollow off for links you want to pass authority to (do-follow), on for
                  links you don&apos;t.
                </p>
                <div className="mt-1.5 space-y-2">
                  {form.links.map((link, i) => {
                    const internal = isInternalUrl(link.url);
                    return (
                      <div key={i} className="rounded-lg border border-slate-200 p-2.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={link.text}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                links: f.links.map((l, idx) =>
                                  idx === i ? { ...l, text: e.target.value } : l
                                ),
                              }))
                            }
                            placeholder="Anchor text"
                            className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                links: f.links.filter((_, idx) => idx !== i),
                              }))
                            }
                            aria-label="Remove"
                            className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                          >
                            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              links: f.links.map((l, idx) =>
                                idx === i ? { ...l, url: e.target.value } : l
                              ),
                            }))
                          }
                          placeholder="https:// or /internal-path"
                          className="mt-1.5 w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                        />
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                            {internal ? (
                              <>
                                <Link2 className="h-3 w-3" strokeWidth={1.75} />
                                Internal
                              </>
                            ) : (
                              <>
                                <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                                External
                              </>
                            )}
                          </span>
                          <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                            <input
                              type="checkbox"
                              checked={link.nofollow}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  links: f.links.map((l, idx) =>
                                    idx === i ? { ...l, nofollow: e.target.checked } : l
                                  ),
                                }))
                              }
                              className="h-3.5 w-3.5 rounded border-slate-300 text-accent-600 focus:ring-accent-600/30"
                            />
                            Nofollow
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ---- Shared: "FAQ" section heading ---- */}
              <div className="rounded-lg border border-dashed border-accent-300 bg-accent-50/40 p-3">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                    Shared across all services — &quot;FAQ&quot; heading
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Editing this here updates it on every service page, not just this one. The
                  questions themselves are set per-service below.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-950">Eyebrow</label>
                    <input
                      type="text"
                      value={sectionForm.faqEyebrow}
                      onChange={(e) => setSectionForm((f) => ({ ...f, faqEyebrow: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">
                      Heading (use <code className="rounded bg-slate-100 px-1">{"{name}"}</code>{" "}
                      for the service name)
                    </label>
                    <input
                      type="text"
                      value={sectionForm.faqHeadingTemplate}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, faqHeadingTemplate: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                </div>
              </div>

              {/* ---- SEO: FAQ ---- */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-950">
                    FAQ (this page only — also feeds FAQ schema)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        faq: [...f.faq, { question: "", answer: "" }],
                      }))
                    }
                    className="text-xs font-medium text-accent-600 hover:text-accent-700"
                  >
                    + Add
                  </button>
                </div>
                <div className="mt-1.5 space-y-2">
                  {form.faq.map((item, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-2.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              faq: f.faq.map((q, idx) =>
                                idx === i ? { ...q, question: e.target.value } : q
                              ),
                            }))
                          }
                          placeholder="Question"
                          className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, faq: f.faq.filter((_, idx) => idx !== i) }))
                          }
                          aria-label="Remove"
                          className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={item.answer}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            faq: f.faq.map((q, idx) =>
                              idx === i ? { ...q, answer: e.target.value } : q
                            ),
                          }))
                        }
                        placeholder="Answer"
                        className="mt-1.5 w-full resize-y rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- Shared: "Related solutions" section heading ---- */}
              <div className="rounded-lg border border-dashed border-accent-300 bg-accent-50/40 p-3">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                    Shared across all services — &quot;Related solutions&quot; heading
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Editing this here updates it on every service page, not just this one. The
                  other services listed there are picked automatically.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-950">Eyebrow</label>
                    <input
                      type="text"
                      value={sectionForm.relatedServicesEyebrow}
                      onChange={(e) =>
                        setSectionForm((f) => ({ ...f, relatedServicesEyebrow: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-950">Card CTA label</label>
                    <input
                      type="text"
                      value={sectionForm.relatedServiceCardCtaLabel}
                      onChange={(e) =>
                        setSectionForm((f) => ({
                          ...f,
                          relatedServiceCardCtaLabel: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium text-ink-950">Heading</label>
                  <input
                    type="text"
                    value={sectionForm.relatedServicesHeading}
                    onChange={(e) =>
                      setSectionForm((f) => ({ ...f, relatedServicesHeading: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                  />
                </div>
              </div>

              <p className="rounded-lg bg-surface-50 px-3 py-2 text-[11px] text-slate-400">
                Schema markup (Service + FAQ structured data) is generated automatically from
                this content — nothing to fill in.
              </p>
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
