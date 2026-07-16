"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
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
  Heading2,
  Heading3,
} from "lucide-react";
import type { TiptapDoc } from "@/lib/blog-content";

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

function Toolbar({ editor }: { editor: Editor }) {
  function setLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

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

      {/* H1 is intentionally absent — the post title is the page's only h1. */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="Heading 2"
      >
        <Heading2 className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="Heading 3"
      >
        <Heading3 className="h-4 w-4" strokeWidth={1.75} />
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

      <ToolbarButton onClick={setLink} active={editor.isActive("link")} label="Link">
        <Link2 className="h-4 w-4" strokeWidth={1.75} />
      </ToolbarButton>
      <ImageInsertPopover editor={editor} />

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
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      TiptapImage.configure({ inline: false }),
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Write the post…" }),
    ],
    content: content as never,
    onUpdate: ({ editor: e }) => onChange(e.getJSON() as TiptapDoc),
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[24rem] max-w-none px-4 py-4 text-body-lg leading-relaxed text-ink-950 outline-none",
      },
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
      <EditorContent editor={editor} />
    </div>
  );
}
