import type { MetadataRoute } from "next";
import { env } from "@/config/env";

/**
 * Dynamic sitemap. Once the API is up, fetch every published product slug here
 * and append it. If the catalogue passes ~50k URLs, split with generateSitemaps.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL;

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.8 },
  ];
}
