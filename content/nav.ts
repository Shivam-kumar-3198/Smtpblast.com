import type { NavItem } from "./types";

export const navItems: NavItem[] = [
  { label: "Features", href: "/features" },
  {
    label: "Solutions",
    dropdown: [
      {
        label: "SMTP Server Provider",
        description: "A private IP and server tuned for your sending volume.",
        href: "/services/dedicated-smtp",
      },
      {
        label: "Bulk Email Services",
        description: "Send campaigns and transactional mail at scale.",
        href: "/services/bulk-email",
      },
      {
        label: "Email Campaign Services",
        description: "Campaign strategy and sending, matched to your setup.",
        href: "/services/email-campaigns",
      },
      {
        label: "Email Marketing Reseller Service",
        description: "White-label servers you can resell under your brand.",
        href: "/services/email-marketing-reseller",
      },
      {
        label: "Email Marketing Services",
        description: "AI-enabled setup, warm-up, and deliverability management.",
        href: "/services/email-marketing",
      },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Company", href: "/company" },
];
