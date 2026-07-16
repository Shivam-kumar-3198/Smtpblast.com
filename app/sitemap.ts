import type { MetadataRoute } from "next";
import { domain } from "@/content/site-settings";
import { listServices } from "@/lib/services-content";
import { listPublishedPosts } from "@/lib/blog";

const siteUrl = `https://${domain}`;

// Same reasoning as the blog pages themselves — without this, newly
// published (or unpublished) posts never reach sitemap.xml until a redeploy.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, services] = await Promise.all([listPublishedPosts(), listServices()]);

  const routes = [
    "",
    ...services.map((service) => `/services/${service.slug}`),
    "/blog",
    ...posts.map((post) => `/blog/${post.slug}`),
    "/company",
    "/talk-to-sales",
    "/get-started",
    "/legal/privacy",
    "/legal/terms",
    "/legal/anti-spam-policy",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
