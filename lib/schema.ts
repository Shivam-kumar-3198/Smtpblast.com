import { domain } from "@/content/site-settings";
import type { SiteSettings } from "@/content/types";

interface FaqItem {
  question: string;
  answer: string;
}

interface PricingTierForSchema {
  name: string;
  isContact: boolean;
  priceUSD: number;
  ctaHref: string;
}

const siteUrl = `https://${domain}`;

export function organizationJsonLd(siteSettings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteSettings.companyName,
    legalName: siteSettings.legalName,
    url: siteUrl,
    ...(siteSettings.email ? { email: siteSettings.email.display } : {}),
    ...(siteSettings.phone ? { telephone: siteSettings.phone.display } : {}),
    ...(siteSettings.social.length
      ? { sameAs: siteSettings.social.map((s) => s.href) }
      : {}),
    ...(siteSettings.officeAddress
      ? {
          address: {
            "@type": "PostalAddress",
            ...siteSettings.officeAddress,
          },
        }
      : {}),
  };
}

export function softwareApplicationJsonLd(
  companyName: string,
  pricingTiers: PricingTierForSchema[]
) {
  const pricedTiers = pricingTiers.filter((tier) => !tier.isContact);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: companyName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    url: siteUrl,
    offers: pricedTiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      price: tier.priceUSD,
      priceCurrency: "USD",
      url: `${siteUrl}${tier.ctaHref}`,
    })),
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function blogPostingJsonLd(
  companyName: string,
  post: {
    title: string;
    slug: string;
    metaDescription: string;
    author: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    publishedAt: Date | null;
    image: { url: string; width: number; height: number };
  }
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    ...(post.publishedAt ? { datePublished: post.publishedAt.toISOString() } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt.toISOString() } : {}),
    author: { "@type": "Person", name: post.author },
    image: {
      "@type": "ImageObject",
      url: post.image.url.startsWith("http") ? post.image.url : `${siteUrl}${post.image.url}`,
      width: post.image.width,
      height: post.image.height,
    },
    publisher: {
      "@type": "Organization",
      name: companyName,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/smtpblast-logo.webp`,
        width: 289,
        height: 43,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
  };
}

export function serviceJsonLd(
  companyName: string,
  service: { name: string; description: string; slug: string }
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: `${siteUrl}/services/${service.slug}`,
    provider: {
      "@type": "Organization",
      name: companyName,
      url: siteUrl,
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}
