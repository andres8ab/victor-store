import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://todoelectricovicto.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/checkout/",
          "/cart/",
          "/profile/",
          "/orders/",
          "/sign-in/",
          "/sign-up/",
          "/_next/image",
          "/_next/image/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
