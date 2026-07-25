import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "./blog-schema";

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
}

export interface TiptapDoc {
  type: "doc";
  content?: TiptapNode[];
}

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

function nodeText(node: TiptapNode): string {
  if (node.text) return node.text;
  if (!node.content) return "";
  return node.content.map(nodeText).join("");
}

/** ~200 wpm, rounded up to the nearest minute, minimum 1 — computed from
 * the actual document rather than a hand-typed field that can go stale. */
export function estimateReadTime(doc: TiptapDoc): string {
  const text = (doc.content ?? []).map(nodeText).join(" ").trim();
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

/**
 * Walks the document once, assigning each H2/H3 a unique, URL-friendly
 * anchor id (deduped by suffixing -2, -3, ... since two headings can share
 * the same text, e.g. two "Overview" sections). Returns both the flat TOC
 * list and a node-identity map, so renderTiptapDoc() can stamp the exact
 * same ids onto the exact same heading nodes the TOC links to — walking
 * twice independently would risk the two falling out of sync.
 */
export function buildToc(doc: TiptapDoc): { toc: TocEntry[]; headingIds: Map<TiptapNode, string> } {
  const toc: TocEntry[] = [];
  const headingIds = new Map<TiptapNode, string>();
  const seen = new Map<string, number>();

  function visit(node: TiptapNode) {
    if (node.type === "heading") {
      const level = Number(node.attrs?.level ?? 2);
      // Editor level 1 ("H1" styling) renders as an <h2> on the page (see
      // renderBlock below), so it belongs in the TOC as a level-2 entry too.
      if (level === 1 || level === 2 || level === 3) {
        const text = nodeText(node).trim();
        if (text) {
          const base = slugify(text) || "section";
          const count = seen.get(base) ?? 0;
          seen.set(base, count + 1);
          const id = count === 0 ? base : `${base}-${count + 1}`;
          const tocLevel: 2 | 3 = level === 3 ? 3 : 2;
          toc.push({ id, text, level: tocLevel });
          headingIds.set(node, id);
        }
      }
    }
    node.content?.forEach(visit);
  }

  doc.content?.forEach(visit);
  return { toc, headingIds };
}

function toInternalPath(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?smtpblast\.com/i, "") || "/";
}

export function isInternalLink(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#") || /smtpblast\.com/i.test(href);
}

/** Detects an explicit "nofollow" token in a link mark's `rel` attribute. */
export function hasNofollowRel(rel: unknown): boolean {
  return typeof rel === "string" && /(^|\s)nofollow(\s|$)/i.test(rel);
}

/** Detects an explicit "sponsored" token in a link mark's `rel` attribute. */
export function hasSponsoredRel(rel: unknown): boolean {
  return typeof rel === "string" && /(^|\s)sponsored(\s|$)/i.test(rel);
}

/**
 * Builds the final `rel` string for a link mark from its individual
 * choices — "open in new tab" contributes the noopener/noreferrer safety
 * tokens, nofollow/sponsored are appended only when set. Shared between
 * save-time sanitization and render-time output so the two stay in sync.
 */
function buildLinkRel(openInNewTab: boolean, nofollow: boolean, sponsored: boolean): string | null {
  const tokens: string[] = [];
  if (openInNewTab) tokens.push("noopener", "noreferrer");
  if (nofollow) tokens.push("nofollow");
  if (sponsored) tokens.push("sponsored");
  return tokens.length ? tokens.join(" ") : null;
}

/**
 * Save-time sanitization already appends target="_blank"/rel on external
 * links and rewrites internal ones to relative paths (see
 * lib/blog-content.ts's sanitizeLinks, applied before the document is
 * persisted) — this render-time check is defense in depth in case content
 * was written some other way (import, direct Firestore edit, etc.).
 */
function renderMarks(node: ReactNode, marks: TiptapMark[] | undefined): ReactNode {
  if (!marks || marks.length === 0) return node;
  return marks.reduce<ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{acc}</strong>;
      case "italic":
        return <em>{acc}</em>;
      case "code":
        return (
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-ink-950 ring-1 ring-slate-900/5">
            {acc}
          </code>
        );
      case "link": {
        const href = String(mark.attrs?.href ?? "");
        if (!href) return acc;
        const nofollow = hasNofollowRel(mark.attrs?.rel);
        const sponsored = hasSponsoredRel(mark.attrs?.rel);
        const openInNewTab = mark.attrs?.target === "_blank";
        const rel = buildLinkRel(openInNewTab, nofollow, sponsored) ?? undefined;
        const target = openInNewTab ? "_blank" : undefined;
        const linkClassName =
          "font-medium text-accent-600 underline decoration-accent-300 decoration-1 underline-offset-[3px] transition-colors duration-200 hover:text-accent-700 hover:decoration-accent-600";
        if (isInternalLink(href)) {
          return (
            <Link href={toInternalPath(href)} target={target} rel={rel} className={linkClassName}>
              {acc}
            </Link>
          );
        }
        return (
          <a href={href} target={target} rel={rel} className={linkClassName}>
            {acc}
          </a>
        );
      }
      default:
        return acc;
    }
  }, node);
}

function renderInline(nodes: TiptapNode[] | undefined): ReactNode[] {
  if (!nodes) return [];
  return nodes.map((node, i) => {
    if (node.type === "text") {
      return <Fragment key={i}>{renderMarks(node.text ?? "", node.marks)}</Fragment>;
    }
    if (node.type === "hardBreak") {
      return <br key={i} />;
    }
    return null;
  });
}

function renderListItemContent(node: TiptapNode): ReactNode {
  return node.content?.map((child, i) => {
    if (child.type === "paragraph") {
      return <Fragment key={i}>{renderInline(child.content)}</Fragment>;
    }
    return <Fragment key={i}>{renderBlock(child, i)}</Fragment>;
  });
}

/**
 * Table cells hold block content (usually a single paragraph), but the
 * standalone <p> styling used at the article's top level (large top
 * margin) would look wrong packed into a cell — render a paragraph inline
 * instead, same pattern as renderListItemContent above.
 */
function renderCellContent(node: TiptapNode): ReactNode {
  return node.content?.map((child, i) => {
    if (child.type === "paragraph") {
      return <Fragment key={i}>{renderInline(child.content)}</Fragment>;
    }
    return <Fragment key={i}>{renderBlock(child, i)}</Fragment>;
  });
}

/**
 * headingIds comes from buildToc() run against this same doc object, so
 * headings get the exact ids the table of contents links to.
 */
export function renderTiptapDoc(doc: TiptapDoc, headingIds: Map<TiptapNode, string>): ReactNode {
  return doc.content?.map((node, i) => renderBlock(node, i, headingIds));
}

function renderBlock(node: TiptapNode, key: number, headingIds?: Map<TiptapNode, string>): ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="mt-5 text-body-lg leading-[1.75] text-slate-600">
          {renderInline(node.content)}
        </p>
      );

    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const id = headingIds?.get(node);
      const text = renderInline(node.content);
      if (level === 1) {
        // Styled as the largest heading in the post body, but emitted as
        // an <h2> — the post title (rendered elsewhere) stays the page's
        // only true <h1>.
        return (
          <h2
            key={key}
            id={id}
            className="mt-12 scroll-mt-24 text-balance text-h3 font-semibold leading-tight tracking-tight text-ink-950"
          >
            {text}
          </h2>
        );
      }
      if (level === 2) {
        return (
          <h2
            key={key}
            id={id}
            className="mt-10 scroll-mt-24 text-balance text-h4 font-semibold leading-tight tracking-tight text-ink-950"
          >
            {text}
          </h2>
        );
      }
      if (level === 3) {
        return (
          <h3
            key={key}
            id={id}
            className="mt-8 scroll-mt-24 text-balance text-lg font-semibold leading-tight tracking-tight text-ink-950"
          >
            {text}
          </h3>
        );
      }
      if (level === 4) {
        return (
          <h4 key={key} id={id} className="mt-6 text-base font-semibold leading-snug text-ink-950">
            {text}
          </h4>
        );
      }
      if (level === 5) {
        return (
          <h5
            key={key}
            id={id}
            className="mt-5 text-sm font-semibold uppercase leading-snug tracking-wide text-ink-950"
          >
            {text}
          </h5>
        );
      }
      return (
        <h6 key={key} id={id} className="mt-4 text-sm font-semibold italic leading-snug text-slate-600">
          {text}
        </h6>
      );
    }

    case "bulletList":
      return (
        <ul
          key={key}
          className="mt-5 list-disc space-y-2.5 pl-6 text-body-lg leading-[1.75] text-slate-600 marker:text-slate-400"
        >
          {node.content?.map((li, i) => (
            <li key={i}>{renderListItemContent(li)}</li>
          ))}
        </ul>
      );

    case "orderedList":
      return (
        <ol
          key={key}
          className="mt-5 list-decimal space-y-2.5 pl-6 text-body-lg leading-[1.75] text-slate-600 marker:text-slate-400"
        >
          {node.content?.map((li, i) => (
            <li key={i}>{renderListItemContent(li)}</li>
          ))}
        </ol>
      );

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="mt-6 rounded-r-xl border-l-4 border-accent-500 bg-accent-50/60 py-4 pl-6 pr-5 text-body-lg italic leading-[1.75] text-slate-700"
        >
          {node.content?.map((child, i) => (
            <Fragment key={i}>{renderBlock(child, i)}</Fragment>
          ))}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre
          key={key}
          className="mt-5 overflow-x-auto rounded-xl bg-ink-950 px-4 py-3.5 text-sm leading-relaxed text-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
        >
          <code>{nodeText(node)}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={key} className="my-10 border-slate-200" />;

    case "image": {
      const src = String(node.attrs?.src ?? "");
      if (!src) return null;
      const alt = String(node.attrs?.alt ?? "");
      const width = Number(node.attrs?.width) || 1200;
      const height = Number(node.attrs?.height) || 675;
      return (
        <span
          key={key}
          className="mt-8 block overflow-hidden rounded-2xl shadow-[0_12px_32px_-16px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/8"
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="(min-width: 1024px) 46rem, 100vw"
            className="h-auto w-full"
          />
        </span>
      );
    }

    case "table":
      return (
        <div key={key} className="mt-8 overflow-x-auto rounded-xl ring-1 ring-slate-900/8">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <tbody>{node.content?.map((row, i) => renderBlock(row, i))}</tbody>
          </table>
        </div>
      );

    case "tableRow":
      return <tr key={key} className="even:bg-surface-50/60">{node.content?.map((cell, i) => renderBlock(cell, i))}</tr>;

    case "tableHeader": {
      const colSpan = Number(node.attrs?.colspan) || 1;
      const rowSpan = Number(node.attrs?.rowspan) || 1;
      return (
        <th
          key={key}
          colSpan={colSpan > 1 ? colSpan : undefined}
          rowSpan={rowSpan > 1 ? rowSpan : undefined}
          className="whitespace-nowrap border-b-2 border-slate-200 bg-surface-50 px-4 py-3 text-left text-sm font-semibold text-ink-950"
        >
          {renderCellContent(node)}
        </th>
      );
    }

    case "tableCell": {
      const colSpan = Number(node.attrs?.colspan) || 1;
      const rowSpan = Number(node.attrs?.rowspan) || 1;
      return (
        <td
          key={key}
          colSpan={colSpan > 1 ? colSpan : undefined}
          rowSpan={rowSpan > 1 ? rowSpan : undefined}
          className="border-b border-slate-100 px-4 py-3 align-top text-sm leading-relaxed text-slate-600"
        >
          {renderCellContent(node)}
        </td>
      );
    }

    default:
      return null;
  }
}

/**
 * Save-time link sanitization: rewrites internal (smtpblast.com) links to
 * relative paths, and rebuilds `rel` from the mark's own target/nofollow/
 * sponsored choices (set per-link via the editor's link popover) rather
 * than forcing target="_blank" on every external link. Mutates a cloned
 * tree — called before persisting a post from the admin editor.
 */
export function sanitizeLinks(doc: TiptapDoc): TiptapDoc {
  function visit(node: TiptapNode): TiptapNode {
    const marks = node.marks?.map((mark) => {
      if (mark.type !== "link") return mark;
      const href = String(mark.attrs?.href ?? "");
      if (!href) return mark;
      const openInNewTab = mark.attrs?.target === "_blank";
      const nofollow = hasNofollowRel(mark.attrs?.rel);
      const sponsored = hasSponsoredRel(mark.attrs?.rel);
      const rel = buildLinkRel(openInNewTab, nofollow, sponsored);
      const target = openInNewTab ? "_blank" : null;
      if (isInternalLink(href)) {
        return { ...mark, attrs: { ...mark.attrs, href: toInternalPath(href), target, rel } };
      }
      return { ...mark, attrs: { ...mark.attrs, target, rel } };
    });
    return {
      ...node,
      ...(marks ? { marks } : {}),
      ...(node.content ? { content: node.content.map(visit) } : {}),
    };
  }

  return { ...doc, content: doc.content?.map(visit) };
}
