"use client";

/**
 * Custom next/image loader that builds Cloudinary transform URLs.
 *
 * Why: routing images through Vercel's /_next/image endpoint counts against
 * the Image Optimization Transformations quota on the free/Pro plans. Cloudinary
 * already does on-the-fly resizing and format selection, so we let it do the
 * work and bypass Vercel's optimizer entirely.
 *
 * Behavior:
 * - For Cloudinary URLs (res.cloudinary.com): inserts c_limit,w_<width>,q_auto,f_auto
 *   right after the `/upload/` segment. Cloudinary picks the best format (AVIF/WebP/JPEG)
 *   per client via f_auto and a sensible quality via q_auto.
 * - For non-Cloudinary URLs (e.g. local /public assets like /hero-bg.png, /logo.png):
 *   returns the src unchanged. Next.js will serve these directly without optimization.
 *
 * Note: this assumes stored Cloudinary URLs do NOT already include transforms
 * between /upload/ and the version/path segment. If you ever add stored transforms,
 * revisit this so we don't stack them.
 */
type LoaderArgs = {
  src: string;
  width: number;
  quality?: number;
};

export default function cloudinaryLoader({ src, width, quality }: LoaderArgs): string {
  // Pass-through for anything that isn't a Cloudinary URL (local /public files, etc.)
  if (!src.includes("res.cloudinary.com")) {
    return src;
  }

  const q = typeof quality === "number" ? `q_${quality}` : "q_auto";
  const transforms = ["f_auto", "c_limit", `w_${width}`, q].join(",");

  // Insert transforms immediately after `/upload/`.
  return src.replace("/upload/", `/upload/${transforms}/`);
}
