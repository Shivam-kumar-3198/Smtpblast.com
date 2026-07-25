"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { TextSelection } from "@tiptap/pm/state";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Table as TableIcon,
  Trash2,
  Pilcrow,
} from "lucide-react";
import { isInternalLink, hasNofollowRel, hasSponsoredRel, type TiptapDoc } from "@/lib/blog-content";

/**
 * Cleans HTML pasted from Word, Excel, or Google Docs before ProseMirror
 * parses it: drops Office boilerplate (conditional comments, style/xml
 * islands, namespaced o:p, w:, v:, m: tags) outright, strips every "class"
 * attribute (carries no meaning in our schema), and strips mso- prefixed
 * style declarations everywhere. Table elements additionally lose their
 * inline style/width/valign/bgcolor entirely so pasted tables always pick
 * up this site's own table styling instead of whatever Word, Sheets, or
 * Docs inlined — structural attributes the table extension actually reads
 * (colspan, rowspan) are left untouched. Non-table elements keep any
 * remaining, non-mso inline style, since ProseMirror's default bold/italic
 * parsing can read formatting straight off a "font-weight" style property.
 */
function cleanPastedHtml(html: string): string {
  if (typeof window === "undefined" || !/<[a-z][\s\S]*>/i.test(html)) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.querySelectorAll("style, xml, meta, link").forEach((el) => el.remove());

  doc.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"));

  doc.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (/^xmlns/i.test(attr.name)) el.removeAttribute(attr.name);
    });
    if (/^(o|w|v|m):/i.test(el.tagName)) {
      el.replaceWith(...Array.from(el.childNodes));
    }
  });

  doc.querySelectorAll("table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col").forEach((el) => {
    el.removeAttribute("style");
    el.removeAttribute("width");
    el.removeAttribute("height");
    el.removeAttribute("valign");
    el.removeAttribute("align");
    el.removeAttribute("bgcolor");
  });

  doc.querySelectorAll("[style]").forEach((el) => {
    if (el.closest("table")) return;
    const kept = (el.getAttribute("style") || "")
      .split(";")
      .map((declaration) => declaration.trim())
      .filter((declaration) => declaration && !/^mso-/i.test(declaration));
    if (kept.length) el.setAttribute("style", kept.join("; "));
    else el.removeAttribute("style");
  });

  return doc.body.innerHTML;
}

/**
 * Applying a heading with a partial text selection inside a plain
 * paragraph splits that paragraph into up to three blocks — the text
 * before the selection (paragraph), the selection itself (the new
 * heading), and the text after (paragraph) — instead of TipTap's default
 * toggleHeading, which always converts the *entire* block regardless of
 * selection. Every other case (no selection, selection spans the whole
 * block, selection spans multiple blocks, or the block isn't a plain
 * paragraph — e.g. splitting inside an existing heading or a list item)
 * falls straight through to the original, untouched toggleHeading
 * behavior. Slices are taken directly off the document so bold/italic/
 * link marks (including nofollow/dofollow rel) travel with the text
 * instead of being re-typed as plain text.
 */
function applyHeading(editor: Editor, level: 1 | 2 | 3 | 4 | 5 | 6) {
  const { state } = editor;
  const { selection, schema } = state;
  const { $from, $to, empty, from, to } = selection;

  const paragraphType = schema.nodes.paragraph;
  const headingType = schema.nodes.heading;
  const blockStart = $from.start();
  const blockEnd = $from.end();

  const isPartialSelection =
    !empty &&
    $from.sameParent($to) &&
    $from.parent.type === paragraphType &&
    (from > blockStart || to < blockEnd);

  if (!isPartialSelection) {
    editor.chain().focus().toggleHeading({ level }).run();
    return;
  }

  const beforeSlice = state.doc.slice(blockStart, from);
  const selectedSlice = state.doc.slice(from, to);
  const afterSlice = state.doc.slice(to, blockEnd);

  const nodes = [];
  if (beforeSlice.size > 0) nodes.push(paragraphType.create(null, beforeSlice.content));
  nodes.push(headingType.create({ level }, selectedSlice.content));
  if (afterSlice.size > 0) nodes.push(paragraphType.create(null, afterSlice.content));

  const blockNodeStart = $from.before();
  const blockNodeEnd = $from.after();

  let headingContentStart = blockNodeStart;
  for (const node of nodes) {
    if (node.type === headingType) {
      headingContentStart += 1;
      break;
    }
    headingContentStart += node.nodeSize;
  }
  const headingContentEnd = headingContentStart + selectedSlice.content.size;

  const tr = state.tr.replaceWith(blockNodeStart, blockNodeEnd, nodes);
  tr.setSelection(TextSelection.create(tr.doc, headingContentStart, headingContentEnd));
  editor.view.dispatch(tr);
  editor.commands.focus();
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-accent-600 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-ink-950"
      }`}
    >
      {children}
    </button>
  );
}

function ImageInsertPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [error, setError] = useState("");

  function handleInsert() {
    if (!url.trim() || !altText.trim()) return;
    setError("");
    editor
      .chain()
      .focus()
      .setImage({ src: url.trim(), alt: altText.trim(), title: altText.trim() } as never)
      .run();
    setOpen(false);
    setUrl("");
    setAltText("");
  }

  return (
    <div className="relative">
      <ToolbarButton onClick={() => setOpen((v) => !v)} active={open} label="Insert image">
        <ImageIcon className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl bg-white p-4 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/8">
          <p className="text-sm font-medium text-ink-950">Insert image</p>
          <label htmlFor="image-url" className="mt-2 block text-xs font-medium text-ink-950">
            Image URL
          </label>
          <input
            id="image-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/10"
          />
          <label htmlFor="image-alt-text" className="mt-3 block text-xs font-medium text-ink-950">
            Alt text <span className="text-danger-600">(required)</span>
          </label>
          <input
            id="image-alt-text"
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe the image for screen readers and SEO"
            className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/10"
          />
          {error && <p className="mt-2 text-xs text-danger-600">{error}</p>}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={!url.trim() || !altText.trim()}
              className="rounded-md bg-accent-600 px-2.5 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Insert
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Text + URL + advanced link options (open in new tab, nofollow,
 * sponsored). Reads the current selection/link on open so editing an
 * existing link prefills its text and choices; inserting a fresh link
 * defaults "open in new tab" and "nofollow" based on whether the URL looks
 * internal or external (recomputed live while the URL field is typed)
 * until the user overrides either checkbox themselves.
 */
function LinkInsertPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [openInNewTabTouched, setOpenInNewTabTouched] = useState(false);
  const [nofollow, setNofollow] = useState(false);
  const [nofollowTouched, setNofollowTouched] = useState(false);
  const [sponsored, setSponsored] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [range, setRange] = useState<{ from: number; to: number } | null>(null);
  const isEditingLink = editor.isActive("link");

  function openPopover() {
    const attrs = editor.getAttributes("link");
    const currentHref = (attrs.href as string | undefined) ?? "";

    // Editing an existing link: expand the selection to its full range so
    // the text field prefills with the whole link text, not just the
    // cursor position, and so apply() replaces the entire link.
    if (isEditingLink) {
      editor.chain().extendMarkRange("link").run();
    }
    const { from, to } = editor.state.selection;
    setRange({ from, to });
    setText(editor.state.doc.textBetween(from, to, " "));
    setUrl(currentHref);
    setOpenInNewTab(currentHref ? attrs.target === "_blank" : !isInternalLink(""));
    setOpenInNewTabTouched(Boolean(currentHref));
    setNofollow(currentHref ? hasNofollowRel(attrs.rel) : !isInternalLink(""));
    setNofollowTouched(Boolean(currentHref));
    setSponsored(currentHref ? hasSponsoredRel(attrs.rel) : false);
    setShowAdvanced(true);
    setOpen((v) => !v);
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    const internal = isInternalLink(value);
    if (!openInNewTabTouched) setOpenInNewTab(!internal);
    if (!nofollowTouched) setNofollow(!internal);
  }

  function close() {
    setOpen(false);
    setRange(null);
  }

  function apply() {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || !range) {
      close();
      return;
    }
    const linkText = text.trim() || trimmedUrl;
    const relTokens: string[] = [];
    if (openInNewTab) relTokens.push("noopener", "noreferrer");
    if (nofollow) relTokens.push("nofollow");
    if (sponsored) relTokens.push("sponsored");

    editor
      .chain()
      .focus()
      .insertContentAt(range, {
        type: "text",
        text: linkText,
        marks: [
          {
            type: "link",
            attrs: { href: trimmedUrl, target: openInNewTab ? "_blank" : null, rel: relTokens.join(" ") || null },
          },
        ],
      } as never)
      .run();
    close();
  }

  function remove() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    close();
  }

  return (
    <div className="relative">
      <ToolbarButton onClick={openPopover} active={isEditingLink || open} label="Link">
        <Link2 className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-80 rounded-xl bg-white p-4 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/8">
          <p className="text-sm font-medium text-ink-950">{isEditingLink ? "Edit link" : "Insert link"}</p>

          <label htmlFor="link-text" className="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Text
          </label>
          <input
            id="link-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Link text"
            className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/10"
          />

          <label htmlFor="link-url" className="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Link
          </label>
          <input
            id="link-url"
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com"
            className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/10"
          />

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-ink-950"
          >
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Advanced
          </button>

          {showAdvanced && (
            <div className="mt-2 space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-medium text-ink-950">
                <input
                  type="checkbox"
                  checked={openInNewTab}
                  onChange={(e) => {
                    setOpenInNewTab(e.target.checked);
                    setOpenInNewTabTouched(true);
                  }}
                  className="h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-accent-600 focus:ring-accent-600/30"
                />
                Open in new tab
              </label>

              <div className="flex items-start gap-2">
                <div className="flex flex-1 items-center gap-4 text-xs font-medium text-ink-950">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="link-follow"
                      checked={!nofollow}
                      onChange={() => {
                        setNofollow(false);
                        setNofollowTouched(true);
                      }}
                      className="h-3.5 w-3.5 shrink-0 border-slate-300 text-accent-600 focus:ring-accent-600/30"
                    />
                    Dofollow
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="link-follow"
                      checked={nofollow}
                      onChange={() => {
                        setNofollow(true);
                        setNofollowTouched(true);
                      }}
                      className="h-3.5 w-3.5 shrink-0 border-slate-300 text-accent-600 focus:ring-accent-600/30"
                    />
                    Nofollow
                  </label>
                </div>
                <span
                  title={
                    'Dofollow lets search engines pass authority through this link. Nofollow adds rel="nofollow" so they don\'t.'
                  }
                >
                  <HelpCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </span>
              </div>

              <div className="flex items-start gap-2">
                <label className="flex flex-1 items-start gap-2 text-xs font-medium text-ink-950">
                  <input
                    type="checkbox"
                    checked={sponsored}
                    onChange={(e) => setSponsored(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-accent-600 focus:ring-accent-600/30"
                  />
                  <span className="leading-snug">
                    This is a sponsored link or advert (mark as{" "}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">sponsored</code>)
                  </span>
                </label>
                <span
                  title="Adds rel=&quot;sponsored&quot; for paid, affiliate, or advertising links, per Google's guidance."
                  className="mt-0.5"
                >
                  <HelpCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-2">
            {isEditingLink ? (
              <button
                type="button"
                onClick={remove}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-danger-600 hover:bg-danger-50"
              >
                Remove
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={apply}
                disabled={!url.trim()}
                className="rounded-md bg-accent-600 px-2.5 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isEditingLink ? "Update" : "Insert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Contextual row/column/table controls, shown only while the cursor is
 * inside a table — the table extension's commands are no-ops outside one.
 */
function TableControls({ editor }: { editor: Editor }) {
  if (!editor.isActive("table")) return null;

  const buttonClass =
    "rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-ink-950";

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-surface-50 px-2 py-1.5">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Table</span>
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().addRowBefore().run()}>
        + Row above
      </button>
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().addRowAfter().run()}>
        + Row below
      </button>
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().deleteRow().run()}>
        Delete row
      </button>
      <span aria-hidden className="mx-1 h-4 w-px bg-slate-200" />
      <button
        type="button"
        className={buttonClass}
        onClick={() => editor.chain().focus().addColumnBefore().run()}
      >
        + Column left
      </button>
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().addColumnAfter().run()}>
        + Column right
      </button>
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().deleteColumn().run()}>
        Delete column
      </button>
      <span aria-hidden className="mx-1 h-4 w-px bg-slate-200" />
      <button
        type="button"
        className={buttonClass}
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      >
        Toggle header row
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteTable().run()}
        aria-label="Delete table"
        title="Delete table"
        className="ml-auto rounded-md p-1.5 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 p-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Bold"
      >
        <Bold className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Italic"
      >
        <Italic className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        label="Inline code"
      >
        <Code className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>

      <span aria-hidden className="mx-1 h-5 w-px bg-slate-200" />

      {/* Level 1 renders as a large styled heading, but is emitted as an
          <h2> on the live page (see renderBlock in lib/blog-content.tsx) —
          the post title stays the page's only true <h1>. Selecting only
          part of a paragraph's text splits it into paragraph/heading/
          paragraph instead of converting the whole block — see
          applyHeading() above. */}
      <ToolbarButton
        onClick={() => applyHeading(editor, 1)}
        active={editor.isActive("heading", { level: 1 })}
        label="Heading 1"
      >
        <Heading1 className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => applyHeading(editor, 2)}
        active={editor.isActive("heading", { level: 2 })}
        label="Heading 2"
      >
        <Heading2 className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => applyHeading(editor, 3)}
        active={editor.isActive("heading", { level: 3 })}
        label="Heading 3"
      >
        <Heading3 className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => applyHeading(editor, 4)}
        active={editor.isActive("heading", { level: 4 })}
        label="Heading 4"
      >
        <Heading4 className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => applyHeading(editor, 5)}
        active={editor.isActive("heading", { level: 5 })}
        label="Heading 5"
      >
        <Heading5 className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => applyHeading(editor, 6)}
        active={editor.isActive("heading", { level: 6 })}
        label="Heading 6"
      >
        <Heading6 className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        active={editor.isActive("paragraph")}
        label="Paragraph (normal text)"
      >
        <Pilcrow className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>

      <span aria-hidden className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Bullet list"
      >
        <List className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Numbered list"
      >
        <ListOrdered className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Quote"
      >
        <Quote className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>

      <span aria-hidden className="mx-1 h-5 w-px bg-slate-200" />

      <LinkInsertPopover editor={editor} />
      <ImageInsertPopover editor={editor} />
      <ToolbarButton
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        active={editor.isActive("table")}
        label="Insert table"
      >
        <TableIcon className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>

      <span aria-hidden className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        label="Undo"
      >
        <Undo2 className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        label="Redo"
      >
        <Redo2 className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
    </div>
  );
}

export function TiptapEditor({
  content,
  onChange,
}: {
  content: TiptapDoc;
  onChange: (doc: TiptapDoc) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      TiptapImage.configure({ inline: false }),
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Write the post…" }),
      TableKit.configure({ table: { resizable: true } }),
    ],
    content: content as never,
    onUpdate: ({ editor: e }) => onChange(e.getJSON() as TiptapDoc),
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[24rem] max-w-none px-4 py-4 text-body-lg leading-relaxed text-ink-950 outline-none",
      },
      transformPastedHTML: cleanPastedHtml,
    },
  });

  // Keep the editor in sync if `content` changes from outside (e.g. the
  // parent form resets after a slug-collision fix) without fighting the
  // user's own typing — only resync when the doc is genuinely different.
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(content);
    if (current !== next) {
      editor.commands.setContent(content as never, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/8">
      <Toolbar editor={editor} />
      <TableControls editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
