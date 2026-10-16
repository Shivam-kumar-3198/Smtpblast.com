/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // This drive is exFAT (external "My Book"), which doesn't support the
  // symlink/reparse-point semantics Next's output file tracing (@vercel/nft)
  // relies on — it walks every module calling readlink() to build the trace,
  // which throws EISDIR on plain files here. Only skip tracing for local
  // builds on this drive via an explicit opt-out — every deploy platform
  // needs the trace output to bundle each route's serverless function with
  // the right dependencies (Firebase App Hosting's adapter requires it for
  // `output: 'standalone'`; without it dependency-heavy routes like the
  // Tiptap blog editor 500 at runtime from missing modules). Previously this
  // keyed off `process.env.CI`, which Netlify sets but Firebase App
  // Hosting's Cloud Build container does not — silently disabling tracing
  // there too and breaking the standalone build.
  outputFileTracing: !process.env.SKIP_OUTPUT_FILE_TRACING,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    // WebP only: AVIF encoding is several times more CPU per image, which on
    // a 1-vCPU scale-to-zero Cloud Run instance is the main image cost.
    formats: ["image/webp"],
    // Optimized variants are cached for 30 days (default is 60s), so each
    // image is resized once instead of on nearly every cold instance.
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
  async headers() {
    // Firebase Auth/Firestore/Storage/Analytics are all called from the
    // client, so connect-src/script-src need their endpoints explicitly —
    // there's no server-side proxy in front of them to tighten this at.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      // 'unsafe-inline' is required for the JSON-LD <Script> blocks (schema.ts)
      // and Next's own inline hydration data — there's no middleware here to
      // mint per-request nonces. gstatic/googletagmanager serve the Firebase
      // Analytics (gtag.js) script. 'unsafe-eval' is added in dev only —
      // Next's Fast Refresh runtime evals modules for HMR; production builds
      // don't need it, so it's kept out of the deployed CSP.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.gstatic.com https://apis.google.com`,
      "style-src 'self' 'unsafe-inline'",
      // Blog/service images are admin-pasted links from arbitrary CDNs
      // (see images.remotePatterns below), so img-src stays broad.
      "img-src 'self' data: https: http:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebasestorage.app https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
      "frame-src 'self' https://*.firebaseapp.com",
    ].join("; ");

    // Files in public/ are served with max-age=0 by default, so every visit
    // revalidates them. Names aren't content-hashed, so keep the browser TTL
    // modest and let the CDN hold them for a month.
    const staticAssetCache = "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800";

    return [
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: staticAssetCache }] },
      { source: "/smtpblast-logo.webp", headers: [{ key: "Cache-Control", value: staticAssetCache }] },
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
