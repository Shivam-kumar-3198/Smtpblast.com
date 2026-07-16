export interface LinkedImage {
  url: string;
  width: number;
  height: number;
}

/**
 * Images are hosted externally (any URL — ImageKit, Firebase Storage, or
 * any other host) and referenced by URL; nothing is uploaded through the
 * app. This just reads the natural width/height off the URL so the
 * SEO/schema fields that need real dimensions still get them.
 */
export function loadImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Couldn't load an image from that URL."));
    img.src = url;
  });
}
