export interface SourcedStat {
  value: string;
  source: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface NavDropdownItem {
  label: string;
  description: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  dropdown?: NavDropdownItem[];
}

export interface ReviewAggregate {
  platform: string;
  rating: number;
  reviewCount: number;
  href: string;
  source: string;
}

export interface ContactChannel {
  display: string;
  href: string;
  source: string;
}

export interface SocialLink {
  platform: string;
  href: string;
}

export interface SiteSettings {
  companyName: string;
  domain: string;
  legalName: string;
  phone: ContactChannel | null;
  whatsapp: ContactChannel | null;
  email: ContactChannel | null;
  social: SocialLink[];
  trustStat: SourcedStat | null;
  reviewAggregate: ReviewAggregate | null;
  officeAddress: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  } | null;
}
