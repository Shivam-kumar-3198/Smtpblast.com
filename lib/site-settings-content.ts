import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { domain } from "@/content/site-settings";
import type { SiteSettings } from "@/content/types";

const SETTINGS_DOC = "siteSettings/main";

export interface SiteSettingsDoc {
  companyName: string;
  legalName: string;
  hasPhone: boolean;
  phoneDisplay: string;
  phoneHref: string;
  phoneSource: string;
  hasWhatsapp: boolean;
  whatsappDisplay: string;
  whatsappHref: string;
  whatsappSource: string;
  hasEmail: boolean;
  emailDisplay: string;
  emailHref: string;
  emailSource: string;
  social: { platform: string; href: string }[];
  hasTrustStat: boolean;
  trustStatValue: string;
  trustStatSource: string;
}

export const EMPTY_SITE_SETTINGS_DOC: SiteSettingsDoc = {
  companyName: "",
  legalName: "",
  hasPhone: false,
  phoneDisplay: "",
  phoneHref: "",
  phoneSource: "",
  hasWhatsapp: false,
  whatsappDisplay: "",
  whatsappHref: "",
  whatsappSource: "",
  hasEmail: false,
  emailDisplay: "",
  emailHref: "",
  emailSource: "",
  social: [],
  hasTrustStat: false,
  trustStatValue: "",
  trustStatSource: "",
};

/**
 * Reads the raw admin-editable doc — used by the Site Settings admin form,
 * which needs the flattened hasX/xDisplay/xHref shape to edit, not the
 * nested ContactChannel-or-null shape the public site consumes.
 */
export async function getSiteSettingsDoc(): Promise<SiteSettingsDoc> {
  try {
    const snap = await getDoc(doc(db, SETTINGS_DOC));
    if (!snap.exists()) return EMPTY_SITE_SETTINGS_DOC;
    return { ...EMPTY_SITE_SETTINGS_DOC, ...(snap.data() as Partial<SiteSettingsDoc>) };
  } catch (err) {
    console.error("getSiteSettingsDoc failed:", err);
    return EMPTY_SITE_SETTINGS_DOC;
  }
}

/**
 * Public frontend shape — same SiteSettings contract every consuming
 * component already expects. Fails soft to "nothing configured yet"
 * rather than a broken page, same rationale as lib/blog.ts's reads.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const raw = await getSiteSettingsDoc();

  return {
    companyName: raw.companyName || "SMTPblast",
    domain,
    legalName: raw.legalName || raw.companyName || "SMTPblast",
    phone: raw.hasPhone
      ? { display: raw.phoneDisplay, href: raw.phoneHref, source: raw.phoneSource }
      : null,
    whatsapp: raw.hasWhatsapp
      ? { display: raw.whatsappDisplay, href: raw.whatsappHref, source: raw.whatsappSource }
      : null,
    email: raw.hasEmail
      ? { display: raw.emailDisplay, href: raw.emailHref, source: raw.emailSource }
      : null,
    social: raw.social,
    trustStat: raw.hasTrustStat
      ? { value: raw.trustStatValue, source: raw.trustStatSource }
      : null,
    reviewAggregate: null,
    officeAddress: null,
  };
}
