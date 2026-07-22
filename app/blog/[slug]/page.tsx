import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, ArrowRight, ChevronDown, Link2, ExternalLink } from "lucide-react";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/blog";
import { buildToc, estimateReadTime, renderTiptapDoc, type TiptapDoc } from "@/lib/blog-content";
import { blogPostingJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/schema";
import { getSiteSettings } from "@/lib/site-settings-content";

/** Internal vs external is inferred from the URL, same rule the blog editor uses. */
function toInternalPath(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?smtpblast\.com/i, "") || "/";
}
function isInternalLink(url: string): boolean {
  return url.startsWith("/") || url.startsWith("#") || /smtpblast\.com/i.test(url);
}

// See app/blog/page.tsx — same reasoning, otherwise a published edit or a
// slug fix in the admin never reaches this page without a full redeploy.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  const canonical = post.seo.canonicalUrl || `/blog/${post.slug}`;

  return {
    title: post.seo.metaTitle || post.title,
    description: post.seo.metaDescription,
    alternates: { canonical },
    keywords: post.seo.focusKeywords.length ? post.seo.focusKeywords : undefined,
    openGraph: {
      type: "article",
      title: post.seo.metaTitle || post.title,
      description: post.seo.metaDescription,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: [post.author],
      images: [
        {
          url: post.featuredImage.url,
          width: post.featuredImage.width,
          height: post.featuredImage.height,
          alt: post.featuredImage.altText,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo.metaTitle || post.title,
      description: post.seo.metaDescription,
      images: [post.featuredImage.url],
    },
  };
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { toc, headingIds } = buildToc(post.content);
  const [allPosts, siteSettings] = await Promise.all([
    listPublishedPosts(),
    getSiteSettings(),
  ]);
  const morePosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <nav aria-label="Breadcrumb" className="text-small text-slate-400">
            <Link href="/" className="hover:text-ink-950">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-ink-950">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink-950">{post.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1fr_16rem]">
            <article className="min-w-0 max-w-2xl">
              <div className="relative mt-6 overflow-hidden rounded-2xl ring-1 ring-slate-900/8">
                <Image
                  src={post.featuredImage.url}
                  alt={post.featuredImage.altText}
                  width={post.featuredImage.width}
                  height={post.featuredImage.height}
                  sizes="(min-width: 1024px) 42rem, 100vw"
                  className="h-auto w-full"
                  priority
                />
              </div>

              <h1 className="mt-6 text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
                {post.title}
              </h1>

              <div className="mt-4 flex items-center gap-2 text-small text-slate-400">
                <span>{post.author}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(post.publishedAt)}</span>
                <span aria-hidden>·</span>
                <span>{estimateReadTime(post.content)}</span>
              </div>

              {toc.length > 0 && (
                <nav aria-label="Table of contents" className="mt-8 rounded-2xl bg-surface-50 p-5 ring-1 ring-slate-900/6 lg:hidden">
                  <p className="text-small font-semibold uppercase tracking-[0.14em] text-slate-400">
                    In this article
                  </p>
                  <ul className="mt-3 space-y-2">
                    {toc.map((entry) => (
                      <li key={entry.id} className={entry.level === 3 ? "pl-4" : ""}>
                        <a href={`#${entry.id}`} className="text-sm text-slate-600 hover:text-accent-600">
                          {entry.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              <div className="border-t border-slate-100 pt-2">
                {renderTiptapDoc(post.content as TiptapDoc, headingIds)}
              </div>

              <div className="mt-12 flex flex-col items-start gap-5 rounded-2xl bg-surface-50 p-8 ring-1 ring-slate-900/6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-ink-950">Questions about your own setup?</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Talk to a deliverability engineer about your sending volume and timeline.
                  </p>
                </div>
                <a
                  href="https://wa.link/zf6mav"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-accent-600 outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
                >
                  Talk to us
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </a>
              </div>

              <Link
                href="/blog"
                className="group mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 outline-none transition-colors hover:text-ink-950 focus-visible:ring-2 focus-visible:ring-accent-500/40"
              >
                <ArrowLeft
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
                  strokeWidth={1.75}
                />
                Back to blog
              </Link>

              {morePosts.length > 0 && (
                <div className="mt-16 border-t border-slate-100 pt-10">
                  <h2 className="text-small font-semibold uppercase tracking-[0.14em] text-slate-400">
                    More from the blog
                  </h2>
                  <ul className="mt-5 space-y-4">
                    {morePosts.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/blog/${p.slug}`} className="group flex items-center gap-4">
                          <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={p.featuredImage.url}
                              alt=""
                              fill
                              sizes="5rem"
                              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-ink-950 transition-colors group-hover:text-accent-600">
                              {p.title}
                            </span>
                            <span className="mt-1 block text-sm text-slate-500">
                              {estimateReadTime(p.content)}
                            </span>
                          </span>
                          <ArrowRight
                            aria-hidden
                            className="h-4 w-4 shrink-0 -translate-x-1 text-accent-500 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                            strokeWidth={1.75}
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {post.faq.length > 0 && (
                <div className="mt-16 border-t border-slate-100 pt-10">
                  <h2 className="text-small font-semibold uppercase tracking-[0.14em] text-slate-400">
                    FAQ
                  </h2>
                  <div className="mt-5 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                    {post.faq.map((item, i) => (
                      <details
                        key={i}
                        className="group border-b border-slate-100 px-6 py-5 last:border-0 open:bg-surface-50/60"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-ink-950 marker:content-none focus-visible:outline-2 focus-visible:outline-accent-600">
                          <span className="text-sm font-medium sm:text-base">{item.question}</span>
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-open:bg-accent-600 group-open:text-white">
                            <ChevronDown
                              className="h-4 w-4 transition-transform duration-300 ease-out group-open:rotate-180"
                              strokeWidth={1.5}
                            />
                          </span>
                        </summary>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {post.links.length > 0 && (
                <div className="mt-16 border-t border-slate-100 pt-10">
                  <h2 className="text-small font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Related links
                  </h2>
                  <ul className="mt-5 flex flex-wrap gap-3">
                    {post.links.map((link, i) => {
                      const internal = isInternalLink(link.url);
                      const LinkIcon = internal ? Link2 : ExternalLink;
                      const className =
                        "inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-800 ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-colors duration-200 ease-out hover:border-slate-300 hover:bg-slate-50";
                      return (
                        <li key={i}>
                          {internal ? (
                            <Link
                              href={toInternalPath(link.url)}
                              rel={link.nofollow ? "nofollow" : undefined}
                              className={className}
                            >
                              <LinkIcon className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                              {link.text}
                            </Link>
                          ) : link.nofollow ? (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className={className}
                            >
                              <LinkIcon className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                              {link.text}
                            </a>
                          ) : (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={className}
                            >
                              <LinkIcon className="h-3.5 w-3.5 text-accent-600" strokeWidth={1.75} />
                              {link.text}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </article>

            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <nav aria-label="Table of contents" className="sticky top-24 rounded-2xl bg-surface-50 p-5 ring-1 ring-slate-900/6">
                  <p className="text-small font-semibold uppercase tracking-[0.14em] text-slate-400">
                    In this article
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {toc.map((entry) => (
                      <li key={entry.id} className={entry.level === 3 ? "pl-4" : ""}>
                        <a
                          href={`#${entry.id}`}
                          className="text-sm leading-snug text-slate-600 hover:text-accent-600"
                        >
                          {entry.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <Script
        id="blog-post-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: "Blog", url: "/blog" },
              { name: post.title, url: `/blog/${post.slug}` },
            ])
          ),
        }}
      />
      <Script
        id="blog-post-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            blogPostingJsonLd(siteSettings.companyName, {
              title: post.title,
              slug: post.slug,
              metaDescription: post.seo.metaDescription,
              author: post.author,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt,
              publishedAt: post.publishedAt,
              image: post.featuredImage,
            })
          ),
        }}
      />
      {post.faq.length > 0 && (
        <Script
          id="blog-post-faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(post.faq)) }}
        />
      )}
    </>
  );
}
