import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientWrapper from "./ClientWrapper";
import { FirebaseAnalytics } from "@/components/FirebaseAnalytics";
import { organizationJsonLd } from "@/lib/schema";
import { getSiteSettings } from "@/lib/site-settings-content";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dedicated SMTP Servers & Bulk Email Service | SMTPblast",
    template: "%s | SMTPblast",
  },
  description:
    "Dedicated SMTP servers with managed IP warm-up and SPF/DKIM/DMARC setup. Live in 24 hours, built for teams sending 100K-10M emails a month.",
  metadataBase: new URL("https://smtpblast.com"),
  openGraph: {
    type: "website",
    siteName: "SMTPblast",
    title: "Dedicated SMTP Servers & Bulk Email Service | SMTPblast",
    description:
      "Dedicated SMTP servers with managed IP warm-up and SPF/DKIM/DMARC setup. Live in 24 hours.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dedicated SMTP Servers & Bulk Email Service | SMTPblast",
    description:
      "Dedicated SMTP servers with managed IP warm-up and SPF/DKIM/DMARC setup. Live in 24 hours.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();

  return (
    <html lang="en" className={roboto.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <ClientWrapper whatsappHref={siteSettings.whatsapp?.href}>{children}</ClientWrapper>
        <Suspense fallback={null}>
          <FirebaseAnalytics />
        </Suspense>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd(siteSettings)),
          }}
        />
      </body>
    </html>
  );
}
