import { z } from "zod";
import type { TiptapDoc } from "./blog-content";

/**
 * TipTap's editor.getJSON() output — a ProseMirror document. Validated
 * loosely (it's structural, produced by the editor, not hand-typed by a
 * user) — the meaningful validation for a blog post is the SEO/metadata
 * fields below, which the strict schema gates on. z.custom() (rather than
 * z.object()) so the inferred type is the real TiptapDoc from
 * lib/blog-content.tsx, not a second, incompatible structural type.
 */
export const tiptapDocSchema = z.custom<TiptapDoc>(
  (val) => typeof val === "object" && val !== null && (val as { type?: unknown }).type === "doc",
  { message: "Invalid content" }
);

export type { TiptapDoc };

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const featuredImageSchema = z.object({
  url: z.string().trim().min(1, "Featured image is required"),
  width: z.number().int().positive("Featured image width is required"),
  height: z.number().int().positive("Featured image height is required"),
  altText: z.string().trim().min(1, "Featured image alt text is required"),
});

export const seoSchema = z.object({
  metaTitle: z
    .string()
    .trim()
    .min(40, "Meta title must be at least 40 characters")
    .max(60, "Meta title must be at most 60 characters"),
  metaDescription: z
    .string()
    .trim()
    .min(130, "Meta description must be at least 130 characters")
    .max(160, "Meta description must be at most 160 characters"),
  focusKeywords: z.array(z.string().trim().min(1)).default([]),
  canonicalUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
});

/**
 * The strict, publish-gating schema — every SEO/image requirement from the
 * spec. A post can only move to status "published" if this passes.
 */
export const blogPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(SLUG_PATTERN, "Slug must be lowercase letters, numbers, and hyphens only"),
  content: tiptapDocSchema,
  seo: seoSchema,
  featuredImage: featuredImageSchema,
  status: z.enum(["draft", "published"]),
  author: z.string().trim().min(1, "Author is required").max(120),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

/**
 * The save-as-draft schema — deliberately minimal. Drafts exist precisely
 * so a post can be saved before its SEO fields are finished; only title,
 * slug, and content are required to persist anything at all.
 */
export const blogDraftSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(SLUG_PATTERN, "Slug must be lowercase letters, numbers, and hyphens only"),
  content: tiptapDocSchema,
  seo: z.object({
    metaTitle: z.string().trim().max(60).default(""),
    metaDescription: z.string().trim().max(160).default(""),
    focusKeywords: z.array(z.string().trim().min(1)).default([]),
    canonicalUrl: z.string().trim().default(""),
  }),
  featuredImage: z.object({
    url: z.string().trim().default(""),
    width: z.number().int().nonnegative().default(0),
    height: z.number().int().nonnegative().default(0),
    altText: z.string().trim().default(""),
  }),
  status: z.enum(["draft", "published"]),
  author: z.string().trim().min(1, "Author is required").max(120),
});

export type BlogDraftInput = z.infer<typeof blogDraftSchema>;

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
