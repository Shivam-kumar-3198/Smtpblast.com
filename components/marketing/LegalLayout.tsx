import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <article className="mx-auto max-w-2xl px-6 py-20">
          <h1 className="text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
            {title}
          </h1>
          <p className="mt-2 text-small text-slate-400">Last updated {lastUpdated}</p>
          <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-slate-600 [&_h2]:mt-8 [&_h2]:text-h4 [&_h2]:font-semibold [&_h2]:text-ink-950 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
