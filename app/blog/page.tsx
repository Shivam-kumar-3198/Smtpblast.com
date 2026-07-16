import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, NotebookPen } from "lucide-react";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { Reveal } from "@/components/marketing/Reveal";
import { SectionEyebrow } from "@/components/marketing/SectionEyebrow";
import { listPublishedPosts } from "@/lib/blog";
import { estimateReadTime } from "@/lib/blog-content";

// Without this the page is fully static (Firestore reads aren't visible to
// Next's cache heuristics), so a post published in the admin would never
// appear here until the next full deploy.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on SMTP deliverability, IP warm-up, and email infrastructure from SMTPblast.",
  alternates: { canonical: "/blog" },
};

function formatDate(date: Date | null) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogPage() {
  const posts = await listPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1 bg-white">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(247,148,29,0.07),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-10 text-center sm:pt-14">
            <Reveal className="flex flex-col items-center gap-4">
              <SectionEyebrow>Blog</SectionEyebrow>
              <h1 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                Notes on deliverability, warm-up, and email infrastructure.
              </h1>
              <p className="max-w-xl text-body-lg text-slate-600">
                Field notes from running dedicated SMTP infrastructure — what actually moves
                inbox placement, and what&apos;s just folklore.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          {featured && (
            <Reveal delay={0.05}>
              <Link
                href={`/blog/${featured.slug}`}
                className="group block overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-300 ease-out hover:shadow-[0_32px_64px_-28px_rgba(15,23,42,0.25)]"
              >
                <div className="relative aspect-video overflow-hidden sm:aspect-21/8">
                  <Image
                    src={featured.featuredImage.url}
                    alt={featured.featuredImage.altText}
                    fill
                    sizes="(min-width: 1024px) 72rem, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    priority
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent"
                  />
                  <span className="absolute bottom-5 left-5 inline-flex items-center rounded-full bg-ink-950/60 px-3 py-1 text-small font-medium text-white backdrop-blur">
                    Featured
                  </span>
                </div>

                <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
                  <div>
                    <h2 className="text-h4 font-semibold tracking-tight text-ink-950 sm:text-h3">
                      {featured.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                      {featured.seo.metaDescription}
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-small text-slate-400">
                      <span>{featured.author}</span>
                      <span aria-hidden>·</span>
                      <span>{formatDate(featured.publishedAt)}</span>
                      <span aria-hidden>·</span>
                      <span>{estimateReadTime(featured.content)}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-accent-600 lg:pr-2">
                    Read article
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          {rest.length > 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, i) => (
                <Reveal key={post.slug} delay={0.1 + i * 0.05}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-300 ease-out hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.22)]"
                  >
                    <div className="relative aspect-16/10 overflow-hidden">
                      <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.altText}
                        fill
                        sizes="(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-h4 font-semibold tracking-tight text-ink-950">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {post.seo.metaDescription}
                      </p>
                      <div className="mt-auto flex items-center gap-2 pt-5 text-small text-slate-400">
                        <span>{formatDate(post.publishedAt)}</span>
                        <span aria-hidden>·</span>
                        <span>{estimateReadTime(post.content)}</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal delay={0.4} className="mt-6">
            <div className="flex flex-col items-start gap-5 rounded-2xl bg-surface-50 p-8 ring-1 ring-slate-900/6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white">
                  <NotebookPen className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="font-medium text-ink-950">
                    {posts.length === 0 ? "No posts published yet." : "More posts on the way."}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Have a deliverability question you&apos;d want us to write about? Tell a
                    deliverability engineer and we&apos;ll take it into account.
                  </p>
                </div>
              </div>
              <Link
                href="/talk-to-sales"
                className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-accent-600 outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
              >
                Talk to us
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
