export const ogImageSize = { width: 1200, height: 630 };
export const ogImageAlt = "SMTPblast — Dedicated SMTP Servers & Bulk Email Service";

/**
 * Shared visual for the sitewide default OG/Twitter card, rendered through
 * Satori (via next/og's ImageResponse) rather than a static asset — colors
 * match the real brand tokens in app/globals.css (--color-ink-950,
 * --color-accent-500/400), not invented ones.
 */
export function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "84px",
        background: "#0b0e14",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 14, height: 14, borderRadius: 999, background: "#f7941d" }} />
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#fab86a",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          SMTPblast
        </span>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 44,
          fontSize: 62,
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.15,
          maxWidth: 960,
        }}
      >
        Dedicated SMTP Servers &amp; Bulk Email Service
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 30,
          fontSize: 28,
          color: "#9099ab",
          maxWidth: 820,
        }}
      >
        Managed IP warm-up, SPF/DKIM/DMARC setup. Live in 24 hours.
      </div>
    </div>
  );
}
