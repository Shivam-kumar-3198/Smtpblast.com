"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, ChevronUp, ChevronDown, X } from "lucide-react";
import { createCollectionCrud } from "@/lib/collection-crud";

export interface FieldConfig<T> {
  key: keyof T & string;
  label: string;
  type: "text" | "textarea";
  required?: boolean;
  placeholder?: string;
}

type WithId<T> = T & { id: string; order: number };

export function SimpleCollectionAdmin<T extends object>({
  collectionName,
  title,
  description,
  fields,
  emptyItem,
  renderPreview,
}: {
  collectionName: string;
  title: string;
  description: string;
  fields: FieldConfig<T>[];
  emptyItem: T;
  renderPreview: (item: WithId<T>) => React.ReactNode;
}) {
  const crud = createCollectionCrud<T>(collectionName);
  const [items, setItems] = useState<WithId<T>[] | null>(null);
  const [editing, setEditing] = useState<WithId<T> | "new" | null>(null);
  const [form, setForm] = useState<T>(emptyItem);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = crud.subscribe(
      (data) => setItems(data as WithId<T>[]),
      () => setError("Couldn't load. Check your connection and try again.")
    );
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  function openNew() {
    setForm(emptyItem);
    setEditing("new");
  }

  function openEdit(item: WithId<T>) {
    setForm(item);
    setEditing(item);
  }

  async function handleSave() {
    setError("");
    const missing = fields.find((f) => f.required && !String(form[f.key] ?? "").trim());
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }
    setSaving(true);
    try {
      if (editing === "new") {
        const nextOrder = (items?.length ?? 0);
        await crud.create({ ...form, order: nextOrder } as T);
      } else if (editing) {
        await crud.update(editing.id, form);
      }
      setEditing(null);
    } catch {
      setError("Something went wrong saving this. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this item? This can't be undone.")) return;
    try {
      await crud.remove(id);
    } catch {
      setError("Couldn't delete that item. Try again.");
    }
  }

  async function handleMove(item: WithId<T>, direction: -1 | 1) {
    if (!items) return;
    const index = items.findIndex((i) => i.id === item.id);
    const swapWith = items[index + direction];
    if (!swapWith) return;
    try {
      await Promise.all([
        crud.update(item.id, { order: swapWith.order } as unknown as Partial<T>),
        crud.update(swapWith.id, { order: item.order } as unknown as Partial<T>),
      ]);
    } catch {
      setError("Couldn't reorder. Try again.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h4 font-semibold tracking-tight text-ink-950">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {items === null && <p className="text-sm text-slate-400">Loading…</p>}
        {items !== null && items.length === 0 && (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400 ring-1 ring-slate-900/8">
            Nothing here yet.
          </p>
        )}
        {items?.map((item, i) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-900/8"
          >
            <div className="min-w-0 flex-1">{renderPreview(item)}</div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => handleMove(item, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => handleMove(item, 1)}
                disabled={i === items.length - 1}
                aria-label="Move down"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => openEdit(item)}
                aria-label="Edit"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-950"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setEditing(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_48px_100px_-40px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-950">
                {editing === "new" ? "Add" : "Edit"}
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
            <div className="mt-4 space-y-3">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-ink-950">
                    {field.label}
                    {field.required && <span className="text-danger-600"> *</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={String(form[field.key] ?? "")}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(form[field.key] ?? "")}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
                    />
                  )}
                </div>
              ))}
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
