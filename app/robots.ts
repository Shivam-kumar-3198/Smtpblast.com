import type { MetadataRoute } from "next";
import { domain } from "@/content/site-settings";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `https://${domain}/sitemap.xml`,
  };
}
