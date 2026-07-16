"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";
import { deletePost, subscribeToAllPosts, type PostRecord } from "@/lib/blog";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState<PostRecord[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAllPosts(
      (data) => setPosts(data),
      () => setError("Couldn't load posts. Check your connection and try again.")
    );
    return () => unsubscribe();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    setPosts((prev) => prev?.filter((p) => p.id !== id) ?? prev);
    try {
      await deletePost(id);
    } catch {
      setError("Couldn't delete that post. Try again.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h4 font-semibold tracking-tight text-ink-950">Blog</h1>
          <p className="text-sm text-slate-500">Every post, draft and published.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New post
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-surface-50">
              <th className="px-5 py-3 text-small font-medium text-slate-400">Title</th>
              <th className="px-5 py-3 text-small font-medium text-slate-400">Status</th>
              <th className="px-5 py-3 text-small font-medium text-slate-400">Updated</th>
              <th className="px-5 py-3 text-small font-medium text-slate-400">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {posts === null && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {posts !== null && posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">
                  No posts yet.
                </td>
              </tr>
            )}
            {posts?.map((post) => (
              <tr key={post.id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-ink-950">{post.title || "Untitled"}</div>
                  <div className="mt-0.5 text-xs text-slate-400">/blog/{post.slug}</div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-small font-medium ${
                      post.status === "published"
                        ? "bg-success-50 text-success-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {post.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-500">{formatDate(post.updatedAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      aria-label={`Edit ${post.title}`}
                      className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink-950"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.75} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id, post.title)}
                      aria-label={`Delete ${post.title}`}
                      className="rounded-full p-2 text-slate-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
