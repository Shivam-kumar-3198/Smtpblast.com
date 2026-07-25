"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X, Link2, ExternalLink } from "lucide-react";
import { TiptapEditor } from "./TiptapEditor";
import type { TiptapDoc } from "@/lib/blog-content";
import {
  blogDraftSchema,
  blogPostSchema,
  slugify,
  slugifyLive,
  type BlogDraftInput,
} from "@/lib/blog-schema";
import { createPost, isSlugTaken, updatePost, type PostRecord } from "@/lib/blog";
import { loadImageDimensions } from "@/lib/storage";

const EMPTY_DOC: TiptapDoc = { type: "doc", content: [{ type: "paragraph" }] };

function emptyFormState(author: string): BlogDraftInput {
  return {
    title: "",
    slug: "",
    content: EMPTY_DOC,
    seo: { metaTitle: "", metaDescription: "", focusKeywords: [], canonicalUrl: "" },
    featuredImage: { url: "", width: 0, height: 0, altText: "" },
    links: [],
    faq: [],
    showToc: true,
    status: "draft",
    author,
  };
}

/** Internal vs external is inferred from the URL, same rule the blog reader uses. */
function isInternalUrl(url: string): boolean {
  return url.startsWith("/") || url.startsWith("#") || /smtpblast\.com/i.test(url);
}

function CharCounter({ value, min, max }: { value: string; min: number; max: number }) {
  const len = value.trim().length;
  const state = len === 0 ? "empty" : len < min ? "low" : len > max ? "high" : "good";
  const colors: Record<string, string> = {
    empty: "text-slate-400",
    low: "text-amber-600",
    high: "text-danger-600",
    good: "text-success-600",
  };
  return (
    <span className={`font-numeric text-xs font-medium ${colors[state]}`}>
      {len}/{min}–{max}
    </span>
  );
}

export function BlogPostForm({
  postId,
  initial,
  authorEmail,
}: {
  postId?: string;
  initial?: PostRecord;
  authorEmail: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<BlogDraftInput>(() =>
    initial
      ? {
          title: initial.title,
          slug: initial.slug,
          content: initial.content,
          seo: initial.seo,
          featuredImage: initial.featuredImage,
          links: initial.links ?? [],
          faq: initial.faq ?? [],
          showToc: initial.showToc ?? true,
          status: initial.status,
          author: initial.author,
        }
      : emptyFormState(authorEmail)
  );
  const [slugEditedManually, setSlugEditedManually] = useState(Boolean(initial));
  const [slugError, setSlugError] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [featuredUrlInput, setFeaturedUrlInput] = useState(initial?.featuredImage.url ?? "");
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const slugCheckToken = useRef(0);

  useEffect(() => {
    const token = ++slugCheckToken.current;
    const slug = form.slug.trim();

    const timer = setTimeout(async () => {
      if (!slug) {
        setSlugError("");
        return;
      }
      try {
        const taken = await isSlugTaken(slug, postId);
        if (slugCheckToken.current !== token) return;
        setSlugError(taken ? "That slug is already used by another post." : "");
      } catch {
        // Non-fatal — the Firestore write will still be attempted; this
        // is just a fast, friendly heads-up before submitting.
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form.slug, postId]);

  const draftCheck = useMemo(() => blogDraftSchema.safeParse(form), [form]);
  const publishCheck = useMemo(
    () => blogPostSchema.safeParse({ ...form, status: "published" }),
    [form]
  );
  const canSaveDraft = draftCheck.success && !slugError;
  const canPublish = publishCheck.success && !slugError;

  async function handleFeaturedImageLink() {
    const url = featuredUrlInput.trim();
    if (!url) return;
    setLoadingFeatured(true);
    setFormError("");
    try {
      const { width, height } = await loadImageDimensions(url);
      setForm((f) => ({ ...f, featuredImage: { ...f.featuredImage, url, width, height } }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't load that image link.");
    } finally {
      setLoadingFeatured(false);
    }
  }

  function clearFeaturedImage() {
    setFeaturedUrlInput("");
    setForm((f) => ({ ...f, featuredImage: { ...f.featuredImage, url: "", width: 0, height: 0 } }));
  }

  function addKeyword() {
    const kw = keywordInput.trim();
    if (!kw || form.seo.focusKeywords.includes(kw)) {
      setKeywordInput("");
      return;
    }
    setForm((f) => ({ ...f, seo: { ...f.seo, focusKeywords: [...f.seo.focusKeywords, kw] } }));
    setKeywordInput("");
  }

  function removeKeyword(kw: string) {
    setForm((f) => ({
      ...f,
      seo: { ...f.seo, focusKeywords: f.seo.focusKeywords.filter((k) => k !== kw) },
    }));
  }

  async function handleSave(target: "draft" | "publish") {
    setFormError("");
    setSuccessMsg("");
    if (slugError) return;

    const schema = target === "publish" ? blogPostSchema : blogDraftSchema;
    const payload = { ...form, status: target === "publish" ? ("published" as const) : form.status };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Fix the highlighted fields first.");
      return;
    }

    if (await isSlugTaken(payload.slug, postId)) {
      setSlugError("That slug is already used by another post.");
      return;
    }

    setSaving(target);
    try {
      let newId = postId;
      if (postId) {
        await updatePost(postId, payload, initial?.status === "published");
      } else {
        newId = await createPost(payload);
      }

      setSuccessMsg(
        target === "publish" ? "Post published successfully." : "Draft saved successfully."
      );
      // Data has reached Firestore at this point. Keep the buttons blocked
      // and the loader spinning through this short pause so the success
      // message is actually visible before we navigate away from it.
      setTimeout(() => {
        if (postId) {
          router.push("/admin/blog");
        } else {
          router.replace(`/admin/blog/${newId}/edit`);
        }
      }, 1100);
    } catch {
      setFormError("Something went wrong saving this post. Try again.");
      setSaving(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      {/* ================= Left: editor ================= */}
      <div>
        <input
          type="text"
          value={form.title}
          onChange={(e) => {
            const title = e.target.value;
            setForm((f) => ({
              ...f,
              title,
              slug: slugEditedManually ? f.slug : slugify(title),
            }));
          }}
          placeholder="Post title"
          className="w-full border-0 bg-transparent text-h3 font-semibold tracking-tight text-ink-950 outline-none placeholder:text-slate-300"
        />
        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <span>/blog/</span>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => {
              setSlugEditedManually(true);
              setForm((f) => ({ ...f, slug: slugifyLive(e.target.value) }));
            }}
            onBlur={() => setForm((f) => ({ ...f, slug: slugify(f.slug) }))}
            className="flex-1 border-0 bg-transparent p-0 text-sm text-ink-950 outline-none"
          />
        </div>
        {slugError && <p className="mt-1 text-xs text-danger-600">{slugError}</p>}

        <div className="mt-5">
          <TiptapEditor
            content={form.content as TiptapDoc}
            onChange={(doc) => setForm((f) => ({ ...f, content: doc as never }))}
          />
        </div>
      </div>

      {/* ================= Right: SEO + metadata ================= */}
      <aside className="space-y-5">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-900/8">
          <h3 className="text-sm font-semibold text-ink-950">Featured image</h3>
          {form.featuredImage.url ? (
            <div className="relative mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.featuredImage.url}
                alt={form.featuredImage.altText}
                className="aspect-video w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={clearFeaturedImage}
                aria-label="Change image"
                className="absolute right-2 top-2 rounded-full bg-ink-950/60 p-1 text-white hover:bg-ink-950/80"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          ) : (
            <div className="mt-3 flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-4 text-slate-400">
              <ImagePlus className="h-6 w-6" strokeWidth={1.5} />
              <span className="text-xs font-medium">Paste any image URL</span>
              <div className="flex w-full items-center gap-1.5">
                <input
                  type="text"
                  value={featuredUrlInput}
                  onChange={(e) => setFeaturedUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleFeaturedImageLink();
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  disabled={loadingFeatured}
                  className="min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs text-ink-950 outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/10"
                />
                <button
                  type="button"
                  onClick={handleFeaturedImageLink}
                  disabled={!featuredUrlInput.trim() || loadingFeatured}
                  className="shrink-0 rounded-md bg-accent-600 px-2.5 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loadingFeatured ? "Loading…" : "Use link"}
                </button>
              </div>
            </div>
          )}
          <label htmlFor="featured-alt" className="mt-3 block text-xs font-medium text-ink-950">
            Alt text <span className="text-danger-600">(required to publish)</span>
          </label>
          <input
            id="featured-alt"
            type="text"
            value={form.featuredImage.altText}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                featuredImage: { ...f.featuredImage, altText: e.target.value },
              }))
            }
            placeholder="Describe the image"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
          />
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-900/8">
          <h3 className="text-sm font-semibold text-ink-950">Display</h3>
          <label className="mt-3 flex items-center gap-2 text-sm text-ink-950">
            <input
              type="checkbox"
              checked={form.showToc}
              onChange={(e) => setForm((f) => ({ ...f, showToc: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-600/30"
            />
            Show Table of Contents
          </label>
          <p className="mt-1 text-[11px] text-slate-400">
            Built automatically from this post&apos;s H2/H3/H4 headings. Turn off to hide it
            on the published page without removing any headings.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-900/8">
          <h3 className="text-sm font-semibold text-ink-950">SEO</h3>

          <div className="mt-3">
            <div className="flex items-center justify-between">
              <label htmlFor="meta-title" className="text-xs font-medium text-ink-950">
                Meta title
              </label>
              <CharCounter value={form.seo.metaTitle} min={40} max={60} />
            </div>
            <input
              id="meta-title"
              type="text"
              value={form.seo.metaTitle}
              onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, metaTitle: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label htmlFor="meta-description" className="text-xs font-medium text-ink-950">
                Meta description
              </label>
              <CharCounter value={form.seo.metaDescription} min={130} max={160} />
            </div>
            <textarea
              id="meta-description"
              rows={3}
              value={form.seo.metaDescription}
              onChange={(e) =>
                setForm((f) => ({ ...f, seo: { ...f.seo, metaDescription: e.target.value } }))
              }
              className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="focus-keywords" className="text-xs font-medium text-ink-950">
              Focus keywords
            </label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {form.seo.focusKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 rounded-full bg-accent-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-accent-600"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    aria-label={`Remove ${kw}`}
                    className="rounded-full p-0.5 hover:bg-accent-100"
                  >
                    <X className="h-3 w-3" strokeWidth={2} />
                  </button>
                </span>
              ))}
            </div>
            <input
              id="focus-keywords"
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              onBlur={addKeyword}
              placeholder="Type a keyword, press Enter"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="canonical-url" className="text-xs font-medium text-ink-950">
              Canonical URL <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="canonical-url"
              type="text"
              value={form.seo.canonicalUrl}
              onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, canonicalUrl: e.target.value } }))}
              placeholder={`https://smtpblast.com/blog/${form.slug || "…"}`}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-900/8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-950">
              SEO links (internal &amp; external)
            </h3>
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
            Internal vs. external is detected automatically from the URL. Toggle Nofollow
            off for links you want to pass authority to (do-follow), on for links you
            don&apos;t.
          </p>
          <div className="mt-2 space-y-2">
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
                        setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }))
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
                    <div className="inline-flex items-center gap-3 text-[11px] font-medium text-slate-500">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name={`link-follow-${i}`}
                          checked={!link.nofollow}
                          onChange={() =>
                            setForm((f) => ({
                              ...f,
                              links: f.links.map((l, idx) =>
                                idx === i ? { ...l, nofollow: false } : l
                              ),
                            }))
                          }
                          className="h-3.5 w-3.5 border-slate-300 text-accent-600 focus:ring-accent-600/30"
                        />
                        Dofollow
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name={`link-follow-${i}`}
                          checked={link.nofollow}
                          onChange={() =>
                            setForm((f) => ({
                              ...f,
                              links: f.links.map((l, idx) =>
                                idx === i ? { ...l, nofollow: true } : l
                              ),
                            }))
                          }
                          className="h-3.5 w-3.5 border-slate-300 text-accent-600 focus:ring-accent-600/30"
                        />
                        Nofollow
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-900/8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-950">
              FAQ (this post only — also feeds FAQ schema)
            </h3>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, faq: [...f.faq, { question: "", answer: "" }] }))
              }
              className="text-xs font-medium text-accent-600 hover:text-accent-700"
            >
              + Add
            </button>
          </div>
          <div className="mt-2 space-y-2">
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
                      faq: f.faq.map((q, idx) => (idx === i ? { ...q, answer: e.target.value } : q)),
                    }))
                  }
                  placeholder="Answer"
                  className="mt-1.5 w-full resize-y rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-accent-600"
                />
              </div>
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-surface-50 px-3 py-2 text-[11px] text-slate-400">
            Schema markup (BlogPosting + FAQ structured data) is generated automatically
            from this post&apos;s content — nothing to fill in.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-900/8">
          <label htmlFor="author" className="text-xs font-medium text-ink-950">
            Author
          </label>
          <input
            id="author"
            type="text"
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
          />
        </div>

        {formError && (
          <p className="rounded-lg border border-danger-500/20 bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {formError}
          </p>
        )}
        {successMsg && (
          <p className="flex items-center gap-2 rounded-lg border border-success-500/20 bg-success-50 px-3.5 py-2.5 text-sm text-success-600">
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" strokeWidth={2.25} />
            {successMsg}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleSave("publish")}
            disabled={!canPublish || saving !== null}
            title={!canPublish ? "Every SEO field must pass before publishing" : undefined}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving === "publish" && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />}
            {saving === "publish" ? "Publishing…" : "Publish"}
          </button>
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={!canSaveDraft || saving !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-ink-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving === "draft" && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />}
            {saving === "draft" ? "Saving…" : "Save draft"}
          </button>
          {!canPublish && (
            <p className="text-center text-xs text-slate-400">
              Publishing needs: title, unique slug, meta title (40–60), meta description
              (130–160), and a featured image with alt text.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
