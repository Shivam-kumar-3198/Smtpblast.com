import { ImageResponse } from "next/og";
import { OgCard, ogImageAlt, ogImageSize } from "@/lib/og-card";

// Node runtime's @vercel/og build hits a Windows/exFAT file-URL bug on this
// machine (same drive quirk next.config.mjs already works around for
// output file tracing); edge is also the better-supported runtime for
// next/og on Netlify regardless, so it stays explicit rather than default.
export const runtime = "edge";
export const size = ogImageSize;
export const contentType = "image/png";
export const alt = ogImageAlt;

export default async function Image() {
  return new ImageResponse(<OgCard />, size);
}
