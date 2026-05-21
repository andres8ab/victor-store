import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Use a custom loader so Cloudinary URLs are built directly instead of
    // going through Vercel's /_next/image optimizer. This bypasses the
    // Image Optimization Transformations quota entirely for Cloudinary-hosted
    // images. Local /public assets pass through unchanged.
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.ts",
    // Trim the srcset Next.js generates. Each entry here becomes one
    // additional Cloudinary URL per <Image> (one per width the browser
    // might pick). Defaults are 8 deviceSizes + 8 imageSizes — overkill
    // for this site.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;