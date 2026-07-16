/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
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
};

export default nextConfig;
