/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // This drive is exFAT (external "My Book"), which doesn't support the
  // symlink/reparse-point semantics Next's output file tracing (@vercel/nft)
  // relies on — it walks every module calling readlink() to build the trace,
  // which throws EISDIR on plain files here. Only skip tracing for local
  // builds on this drive; every CI/deploy platform (Netlify, Vercel, ...)
  // builds on a normal filesystem and needs the trace output to bundle each
  // route's serverless function with the right dependencies — without it,
  // dependency-heavy routes (e.g. the Tiptap-based blog editor) 500 at
  // runtime on Vercel from missing modules that never got traced in.
  outputFileTracing: Boolean(process.env.CI),
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Blog/service images are pasted in as external links (any host — admins
    // can point at ImageKit, Firebase Storage, or any other CDN) rather than
    // uploaded — next/image throws for any host not listed here, which
    // otherwise crashes the blog list/post and services pages outright.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  webpack: (config) => {
    // Same exFAT drive issue: webpack's resolver and its persistent
    // filesystem cache both snapshot symlinks via readlink, which throws
    // EISDIR here. Skip symlink resolution and fall back to the in-memory
    // cache so neither path touches readlink.
    config.resolve.symlinks = false;
    config.cache = { type: "memory" };
    return config;
  },
};

export default nextConfig;
