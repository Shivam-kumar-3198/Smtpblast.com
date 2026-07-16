"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { getPostById, type PostRecord } from "@/lib/blog";
import { auth } from "@/lib/firebase";

export default function EditBlogPostPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<PostRecord | null | "loading" | "not-found">("loading");

  useEffect(() => {
    let cancelled = false;
    getPostById(params.id)
      .then((data) => {
        if (cancelled) return;
        setPost(data ?? "not-found");
      })
      .catch(() => {
        if (!cancelled) setPost("not-found");
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div>
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-ink-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Back to blog
      </Link>

      <div className="mt-4">
        {post === "loading" && <p className="text-sm text-slate-400">Loading…</p>}
        {post === "not-found" && <p className="text-sm text-danger-600">Post not found.</p>}
        {post && post !== "loading" && post !== "not-found" && (
          <BlogPostForm
            postId={post.id}
            initial={post}
            authorEmail={auth.currentUser?.email ?? ""}
          />
        )}
      </div>
    </div>
  );
}
