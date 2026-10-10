import type { MetadataRoute } from "next"

import { site } from "@/shared/config/site"

/** Every public, indexable page. Everything else is private or noindex. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, site.url).href
  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/sign-up"), changeFrequency: "yearly", priority: 0.6 },
    { url: url("/sign-in"), changeFrequency: "yearly", priority: 0.3 },
    { url: url("/terms"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/cookies"), changeFrequency: "yearly", priority: 0.2 },
  ]
}
