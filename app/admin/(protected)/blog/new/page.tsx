"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { auth } from "@/lib/firebase";

export default function NewBlogPostPage() {
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
        <BlogPostForm authorEmail={auth.currentUser?.email ?? ""} />
      </div>
    </div>
  );
}
